import startServer from "./server";
import request from "request-promise-native";
import { Server } from "http";
import { pathMatch } from "tough-cookie";
import { URL } from 'url';

const port = 5337;
const protocol = "http"
const hostName = "localhost";
const baseURl = `${protocol}://${hostName}:${port}`;

const get = async (route) => {
  const url = new URL(route, baseURl);
  return await request(url.toString());
};

describe("Hello world", () => {
  let server: Server;

  beforeAll(async () => {
    server = await startServer(port);
  });

  afterAll(async () => {
    server.close();
  });

  it("returns 'Hello, World!' from a GET '/'' ", async () => {
    const result = await get("/");
    expect(result).toBe("Hello, World!");
  });
});
