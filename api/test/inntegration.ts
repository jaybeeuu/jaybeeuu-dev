import { ParamsDictionary, Request, NextFunction } from "express-serve-static-core";
import request from "request-promise-native";
import { URL } from "url";
import startServer, { CloseServer } from "../src/server";

jest.mock("morgan", () => () => (
  req: Request<ParamsDictionary>,
  res: Response,
  next: NextFunction
) => next());
jest.mock("../src/log");

const port = 5337;
const protocol = "http";
const hostName = "localhost";
const baseURl = `${protocol}://${hostName}:${port}`;

export const get = async (route: string) => {
  const url = new URL(route, baseURl);
  return await request(url.href);
};

export const setupServer = () => {
  let closeServer: CloseServer;

  beforeAll(async () => {
    closeServer = await startServer(port);
  });

  afterAll(async () => {
    await closeServer();
  });
};