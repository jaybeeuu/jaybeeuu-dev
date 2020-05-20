import "./mock-env";

import { ParamsDictionary, Request, NextFunction } from "express-serve-static-core";
import fs from "fs";
import { Agent } from "https";
import nodeFetch, { Response, RequestInit } from "node-fetch";
import { URL } from "url";
import { HttpMethod } from "../src/cors";
import { API_PORT, API_HOST_NAME, CLIENT_HOST_NAME, CLIENT_PORT } from "../src/env";
import { resolveApp } from "../src/paths";

jest.mock("morgan", () => () => (
  req: Request<ParamsDictionary>,
  res: Response,
  next: NextFunction
) => next());

jest.mock("../src/log");

export type RequestOptions = Omit<RequestInit, "method"> & {
  method?: HttpMethod
};

export type Fetch = (route: string, init?: RequestOptions) => Promise<Response>;

const agent = new Agent({
  host: "localhost",
  port: API_PORT,
  ca: fs.readFileSync(resolveApp("../../certs/bickley-wallace-ca.crt"))
});

const defaultOptions: RequestOptions = {
  headers: {
    "Origin": new URL(`https://${CLIENT_HOST_NAME}:${CLIENT_PORT}`).toString(),
    "Content-Type": "application/json"
  }
};

export const fetch: Fetch = async (
  route: string,
  options?: RequestOptions
): Promise<Response> => {
  const baseURl = new URL(`https://${API_HOST_NAME}:${API_PORT}`).toString();
  const url = new URL(route, baseURl);

  return await nodeFetch(
    url.href,
    {
      agent,
      ...defaultOptions,
      ...options
    }
  );
};

export const fetchOK = async (route: string,
  options?: RequestOptions
): Promise<Response> => {
  const response = await fetch(route, options);

  if (response.ok) {
    return response;
  }
  throw new Error(`Response was not OK:\n\n${JSON.stringify({
    status: response.status,
    statusText: response.statusText,
    text: await response.text(),
    url: response.url
  }, null, 2)}}`);
};