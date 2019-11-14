import startServer, { CloseServer } from "./server";
import request from "request-promise-native";
import { URL } from "url";

jest.mock("./logger");

const port = 5337;
const protocol = "http";
const hostName = "localhost";
const baseURl = `${protocol}://${hostName}:${port}`;

const get = async (route) => {
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
