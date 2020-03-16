import env from "./mock-env";

import { ParamsDictionary, Request, NextFunction } from "express-serve-static-core";
import request, { RequestPromiseOptions } from "request-promise-native";
import { URL } from "url";
import startServer, { CloseServer } from "../src/server";

jest.mock("morgan", () => () => (
  req: Request<ParamsDictionary>,
  res: Response,
  next: NextFunction
) => next());
jest.mock("../src/log");

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
