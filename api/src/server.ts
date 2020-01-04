import chalk from "chalk";
import cookieParser from "cookie-parser";
import express, { Express } from "express";
import fs from "fs";
import http from "http";
import https from "https";
import { Server } from "net";
import morgan from "morgan";
import log from "./log";
import registerRoutes from "./routes/index";
import path from "path";

type CloseServer = () => Promise<void>;

const promiseReadFile = (path: string): Promise<Buffer> => {
  return new Promise((resolve) => fs.readFile(path, (error, data) => {
    if (error) {
      throw error;
    }
    resolve(data);
  }));
};

const resolveCertFilePath = (filename: string): string => path.resolve(__dirname, "../certs", filename);

const getSSLOptions = async (): Promise<https.ServerOptions> => {

  const [ cert, key ] = await Promise.all([
    promiseReadFile(resolveCertFilePath("certificate.crt")),
    promiseReadFile(resolveCertFilePath("private.key"))
  ]);

  return { cert, key };
};

const startServer = async (server: Server, port: number, protocol: string): Promise<CloseServer> => {
  await new Promise((resolve) => server.listen(port, resolve));

  log.info(`${chalk.yellow("Listening on port")} ${chalk.blue(port)}!`, `${protocol}://localhost:${port}`);

  return async () => {
    const result = await new Promise((resolve) => server.close(resolve));

    if (result instanceof Error) {
      throw Error;
    };
  };
};

export default async (httpPort: number, httpsPort: number): Promise<CloseServer> => {
  const app = express();

  app.use(morgan("dev"));
  app.use(express.static("public"));
  app.use(cookieParser());

  registerRoutes(app);

  const closeHttp = startServer(http.createServer(app), httpPort, 'http');
  const closeHttps = startServer(https.createServer(await getSSLOptions(), app), httpsPort, 'https');

  return async () => {
    await Promise.all([closeHttp, closeHttps]);
  }
};
