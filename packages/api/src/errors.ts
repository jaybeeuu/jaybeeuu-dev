import * as log from "./log";
import { ErrorRequestHandler } from "express";
import { NODE_ENV, Environments } from "./env";
import { HttpStatusCode } from "./http-constants";

interface ErrorResponseBody {
  message: string;
  stack?: string;
  status: HttpStatusCode;
}

const isValidStatusCode = (candidate: any): boolean => {
  return Object.values(HttpStatusCode).includes(candidate);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  log.error("Error occurred durring request", error);
  const status = isValidStatusCode(error.status) ? error.status : HttpStatusCode.INTERAL_SERVER_ERROR;
  res.status(status);
  const ressponseBody: ErrorResponseBody = {
    message: error.message || JSON.stringify(error),
    status: status
  };

  if (NODE_ENV !== Environments.PRODUCTION && error.stack) {
    ressponseBody.stack = error.stack;
  }

  res.json(ressponseBody);
};