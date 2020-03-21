import chalk from "chalk";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import fs from "fs";
import https from "https";
import morgan from "morgan";
import { Server } from "net";
import { URL } from "url";
import registerRoutes from "./routes/index";
import { API_PORT, CLIENT_HOST_NAME, CLIENT_PORT } from "./env";
import log from "./log";
import { certs } from "./paths";

export type CloseServer = () => Promise<void>;

const promiseReadFile = (path: string): Promise<Buffer> => {
  return new Promise((resolve) => fs.readFile(path, (error, data) => {
    if (error) {
      throw error;
    }
    resolve(data);
  }));
};

const getSSLOptions = async (): Promise<https.ServerOptions> => {

  const [ cert, key ] = await Promise.all([
    promiseReadFile(certs.certificate),
    promiseReadFile(certs.key)
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
    }
  };
};

const getClientOrigin = (): string => {
  const clientUrl = new URL(`https://${CLIENT_HOST_NAME}:${CLIENT_PORT}`).toString();
  return clientUrl.replace(/\/$/, "");
};

export default async (): Promise<CloseServer> => {
  const app = express();
  app.use(cors({
    origin: getClientOrigin()
  }));
  app.use(morgan("dev"));
  app.use(express.static("public"));
  app.use(cookieParser());

  registerRoutes(app);

  return startServer(https.createServer(await getSSLOptions(), app), API_PORT, "https");
};
