import cors, { CorsOptions } from "cors";
import { URL } from "url";
import { CLIENT_HOST_NAME, CLIENT_PORT } from "./env";
import { HttpMethod } from "./http-methods";

const formatUrl = (host: string): string => {
  return new URL(`https://${host}:${CLIENT_PORT}`).toString();
};

const whitelist = CLIENT_HOST_NAME === "localhost" ? [
  formatUrl("localhost"),
  formatUrl("0.0.0.0"),
  formatUrl("127.0.0.1")
] : [formatUrl(CLIENT_HOST_NAME)];

const getAllowedOrigins: Extract<CorsOptions["origin"], Function> = (origin, callback) => {
  if (origin && whitelist.includes(new URL(origin).toString())) {
    callback(null, true);
  } else {
    callback(new Error(`Origin "${origin}" not allowed by CORS.`), false);
  }
};

export { HttpMethod };

export type AllowCorsOptions = Omit<CorsOptions, "methods" | "origin"> & {
  methods: HttpMethod[];
}

export const allowCors = (options?: AllowCorsOptions): ReturnType<typeof cors> => cors({
  origin: getAllowedOrigins,
  ...options
});