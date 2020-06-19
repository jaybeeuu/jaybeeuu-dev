import { RequestHandler } from "express";

export const withHandledErrors = (
  handler: RequestHandler
): RequestHandler => async (req, res, next) => handler(req, res, next).catch(next);