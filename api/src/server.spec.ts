import startServer, { CloseServer } from "./server";
import request from "request-promise-native";
import { URL } from "url";
import { ParamsDictionary, Request, NextFunction } from "express-serve-static-core";

jest.mock("morgan", () => () => (
  req: Request<ParamsDictionary>,
  res: Response,
  next: NextFunction
) => next());
jest.mock("./logger");

const port = 5337;
const protocol = "http";
const hostName = "localhost";
const baseURl = `${protocol}://${hostName}:${port}`;

const get = async (route: string) => {
  const url = new URL(route, baseURl);
  return await request(url.href);
};

describe("Hello world", () => {
  let closeServer: CloseServer;

  beforeAll(async () => {
    closeServer = await startServer(port);
  });

  afterAll(async () => {
    await closeServer();
  });

  it("returns 'Hello, World!' from a GET '/' ", async () => {
    const result = await get("/");
    expect(result).toBe("Hello, World!");
  });
});
