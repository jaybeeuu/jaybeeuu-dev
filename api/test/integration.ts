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

const hostName = "localhost";
const http = {
  port: 5337,
  protocol: "http"
};

const https = {
  port: 5338,
  protocol: "https",
  options: {
    strictSSL: false
  }
};

type Get = (route: string) => Promise<any>;

const makeGet = (
  { protocol, port, options = {} }: {
    protocol: string,
    port: number,
    options?: RequestPromiseOptions
  },
  host: string,
): Get => async (
  route: string
): Promise<any> => {
  const baseURl = `${protocol}://${host}:${port}`;
  const url = new URL(route, baseURl);
  return await request(url.href, options);
};
const httpGet = makeGet(http, hostName);
const httpsGet = makeGet(https, hostName);

export const describeRoute = (
  description: string,
  tests: (get: Get) => () => void
): void => {
  describe(description, () => {
    let closeServer: CloseServer;

    beforeAll(async () => {
      closeServer = await startServer(http.port, https.port);
    });

    afterAll(async () => {
      await closeServer();
    });

    describe("http", tests(httpGet));
    describe("https", tests(httpsGet));
  });
};
