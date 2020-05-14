import chalk from "chalk";
import cookieParser from "cookie-parser";
import cors, { CorsOptions } from "cors";
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

const getSSLOptions = async (): Promise<https.ServerOptions> => {
  const [ cert, key ] = await Promise.all([
    fs.promises.readFile(certs.certificate),
    fs.promises.readFile(certs.key)
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

const formatUrl = (host: string): string => {
  const clientUrl = new URL(`https://${host}:${CLIENT_PORT}`).toString();
  return clientUrl.replace(/\/$/, "");
};

const makeGetAllowedOrigins = (): Extract<CorsOptions["origin"], Function>  => {
  const whitelist = CLIENT_HOST_NAME === "localhost" ? [
    formatUrl("localhost"),
    formatUrl("0.0.0.0"),
    formatUrl("127.0.0.1")
  ] : [formatUrl(CLIENT_HOST_NAME)];

  return (origin, callback): void => {
    if (origin && whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Origin "${origin}" not allowed by CORS.`), false);
    }
  };
};

export default async (): Promise<CloseServer> => {
  const app = express();
  app.use(cors({
    origin: makeGetAllowedOrigins()
  }));
  app.use(morgan("dev"));
  app.use(express.static("public"));
  app.use(cookieParser());

  registerRoutes(app);

  return startServer(https.createServer(await getSSLOptions(), app), API_PORT, "https");
};
