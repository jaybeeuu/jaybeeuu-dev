import * as log from "./log";
import { ErrorRequestHandler } from "express";
import { NODE_ENV } from "./env";
import { HttpStatusCode } from "./http-constants";

interface ErrorResponseBody {
  message: string;
  stack?: string;
  status: HttpStatusCode;
}

const isValidStatusCode = (candidate: any) => {
  return Object.values(HttpStatusCode).includes(candidate);
};

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  log.error(error);
  const status = isValidStatusCode(error.status) ? error.status : HttpStatusCode.INTERAL_SERVER_ERROR;
  res.status(status);
  const ressponseBody: ErrorResponseBody = {
    message: error.message || JSON.stringify(error),
    status: status
  };

  if (NODE_ENV !== "production" && error.stack) {
    ressponseBody.stack = error.stack;
  }

  res.json(ressponseBody);
  return res.status(500).json({ error: error.toString() });
};