import { RequestHandler } from "express";
import log from "../log";
import { NODE_ENV } from "../env";

export const withHandledErrors = (
  handler: RequestHandler
): RequestHandler => async (req, res, next) => {
  try {
    await handler(req, res, next);
  } catch (error) {
    log.error(error);
    res.status(500).json({
      message: error.message || error,
      stack: NODE_ENV === "production" ? undefined : error.stack
    });
  }
};