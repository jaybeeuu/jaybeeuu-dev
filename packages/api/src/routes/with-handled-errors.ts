import { RequestHandler } from "express";
import log from "../log";

export const withHandledErrors = (handler: RequestHandler): RequestHandler =>
  async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      log.error(error);
      res.status(500).json({
        message: error.message || error
      });
    }
  };