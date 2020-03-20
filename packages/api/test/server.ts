import "./mock-env";

import { Request, NextFunction, Response } from "express";
import startServer, { CloseServer } from "../src/server";

jest.mock("morgan", () => () => (
  req: Request<any>,
  res: Response,
  next: NextFunction
) => next());

jest.mock("../src/log");

export const useServer = (): void => {
  let closeServer: CloseServer;

  // eslint-disable-next-line jest/require-top-level-describe
  beforeAll(async () => {
    closeServer = await startServer();
  });

  // eslint-disable-next-line jest/require-top-level-describe
  afterAll(async () => {
    await closeServer();
  });
};
