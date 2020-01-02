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

type CloseServer = () => Promise<void>;

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

  var sslOptions = {
    key: fs.readFileSync('./certs/key.pem'),
    cert: fs.readFileSync('./certs/cert.pem')
  };

  registerRoutes(app);

  const closeHttp = startServer(http.createServer(app), httpPort, 'http');
  const closeHttps = startServer(https.createServer(app, sslOptions), httpsPort, 'https');

  return async () => {
    await Promise.all([closeHttp, closeHttps]);
  }
};
