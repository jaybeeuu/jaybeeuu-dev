import "./mock-env";

import { ParamsDictionary, Request, NextFunction } from "express-serve-static-core";
import fs from "fs";
import { Agent } from "https";
import nodeFetch, { Response, RequestInit } from "node-fetch";
import path from "path";
import { URL } from "url";
import { API_PORT, API_HOST_NAME } from "../src/env";

jest.mock("morgan", () => () => (
  req: Request<ParamsDictionary>,
  res: Response,
  next: NextFunction
) => next());

jest.mock("../src/log");

export enum Verbs {
  /**
   * The GET method requests a representation of the specified resource. Requests using GET should only retrieve data.
   */
  GET = "GET",
  /**
   * The POST method is used to submit an entity to the specified resource, often causing a change in state or side effects on the server.
   */
  POST = "POST",
  /**
   * The PUT method replaces all current representations of the target resource with the request payload.
   */
  PUT = "PUT",
  /**
   * The PATCH method is used to apply partial modifications to a resource.
   */
  PATCH = "PATCH",
  /**
   * The DELETE method deletes the specified resource.
   */
  DELETE = "DELETE",
  /**
   * The HEAD method asks for a response identical to that of a GET request, but without the response body.
   */
  HEAD = "HEAD",
  /**
   * The CONNECT method establishes a tunnel to the server identified by the target resource.
   */
  CONNECT = "CONNECT",
  /**
   * The OPTIONS method is used to describe the communication options for the target resource.
   */
  OPTIONS = "OPTIONS",
  /**
   * The TRACE method performs a message loop-back test along the path to the target resource.
   */
  TRACE = "TRACE"
}

export type RequestOptions = Omit<RequestInit, "method"> & {
  method?: Verbs
};

export type Fetch = (route: string, init?: RequestOptions) => Promise<Response>;

const agent = new Agent({
  host: "localhost",
  port: API_PORT,
  ca: fs.readFileSync(path.join(__dirname, "../certs/certificate.crt"))
});

export const fetch: Fetch = async (
  route: string,
  options?: RequestOptions
): Promise<Response> => {
  const baseURl = new URL(`https://${API_HOST_NAME}:${API_PORT}`).toString();
  const url = new URL(route, baseURl);

  const response = await nodeFetch(url.href, { agent, ...options });
  if (response.ok) {
    return response;
  }

  throw new Error(`Request to ${url} returned: ${response.status} (${response.statusText})\n\n${await response.text()}`);
};