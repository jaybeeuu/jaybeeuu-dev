import chalk from "chalk";
import express from "express";
import cookieParser from "cookie-parser";
import { Server } from "http";
import morgan from "morgan";
import log from "./log";
import rootRouter from "./routes/root";

export type CloseServer = () => Promise<Error | undefined>;

export default async (port: number): Promise<CloseServer> => {
  const app = express();

  app.use(morgan("dev"));
  app.use(express.static("public"));
  app.use(cookieParser());

  app.use("/", rootRouter);

  const server: Server = await new Promise((resolve) => {
    const innerServer = app.listen(
      port,
      () => { resolve(innerServer); }
    );
  });

  log.info(`${chalk.green("Listening on port")} ${chalk.blue(port)}!`);

  return () => new Promise((resolve) => server.close(resolve));
};
