import chalk from "chalk";
import compression from "compression";
import cookieParser from "cookie-parser";
import express from "express";
import fs from "fs";
import https from "https";
import morgan from "morgan";
import { Server } from "net";
import registerRoutes from "./routes/index";
import { API_PORT, NODE_ENV, Envs } from "./env";
import * as log from "./log";
import { certs } from "./paths";
import { errorHandler } from "./errors";

export type CloseServer = () => Promise<void>;

const getSSLOptions = async (): Promise<https.ServerOptions> => {
  const [ cert, key ] = await Promise.all([
    fs.promises.readFile(certs.certificate),
    fs.promises.readFile(certs.key)
  ]);

  return { cert, key };
};

const startServer = async (server: Server, port: number, protocol: string): Promise<CloseServer> => {
  await new Promise((resolve) => server.listen(port, resolve));

  if (NODE_ENV !== Envs.PRODUCTION) {
    log.info(`Running in process: ${process.pid}`);
  }

  log.info(`${chalk.yellow("Listening on port")} ${chalk.blue(port)}!`, `${protocol}://localhost:${port}`);

  return async () => {
    const result = await new Promise((resolve) => server.close(resolve));

    if (result instanceof Error) {
      throw Error;
    }
  };
};

export default async (): Promise<CloseServer> => {
  const app = express();
  app.use(compression());
  app.use(morgan("dev"));
  app.use(express.static("public"));
  app.use(cookieParser());

  registerRoutes(app);

  app.use(errorHandler);

  return startServer(https.createServer(await getSSLOptions(), app), API_PORT, "https");
};
