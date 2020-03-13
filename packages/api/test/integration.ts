import { ParamsDictionary, Request, NextFunction } from "express-serve-static-core";
import request, { RequestPromiseOptions } from "request-promise-native";
import { URL } from "url";
import startServer, { CloseServer } from "../src/server";
import env from "../src/env";


jest.mock("morgan", () => () => (
  req: Request<ParamsDictionary>,
  res: Response,
  next: NextFunction
) => next());
jest.mock("../src/log");
jest.mock("../src/env", () => {
  const jestWorkerId: number = +(process.env.JEST_WORKER_ID || 0);
  return {
    API_HOST_NAME: "localhost",
    API_PORT: 5338 + jestWorkerId,
    CLIENT_HOST_NAME: "localhost",
    CLIENT_PORT: 5237 + jestWorkerId,
    NODE_ENV: process.env.NODE_ENV
  };
});

const requestOptions = {
  strictSSL: false
};

type Get = (route: string) => Promise<any>;

const makeGet = (
  options: RequestPromiseOptions = {}
): Get => async (
  route: string
): Promise<any> => {
  const baseURl = new URL(`https://${env.API_HOST_NAME}:${env.API_PORT}`).toString();
  const url = new URL(route, baseURl);
  return await request(url.href, options);
};

const httpsGet = makeGet(requestOptions);

export const isRoute = (
  tests: (get: Get) => void
): void => {
  let closeServer: CloseServer;

  // eslint-disable-next-line jest/require-top-level-describe
  beforeAll(async () => {
    closeServer = await startServer();
  });

  // eslint-disable-next-line jest/require-top-level-describe
  afterAll(async () => {
    await closeServer();
  });

  tests(httpsGet);
};
