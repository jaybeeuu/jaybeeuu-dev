import express, { RequestHandler } from "express";
import fs from "fs";
import simpleGit from "simple-git/promise";
import { REMOTE_POST_REPO } from "../env";
import { postRepoDirectory, resolveApp } from "../paths";
import { canAccess } from "../files/index";

const router = express.Router();

const asyncMiddleware = (handler: RequestHandler): RequestHandler =>
  (req, res, next) => {
    handler(req, res, next).catch(next);
  };

router.post(
  "/",
  asyncMiddleware(async (req, res): Promise<void> => {
    if (await canAccess(postRepoDirectory)) {
      await simpleGit(postRepoDirectory).pull();
    } else {
      await fs.promises.mkdir(postRepoDirectory, { recursive: true });
      await simpleGit(postRepoDirectory).clone(resolveApp(REMOTE_POST_REPO), postRepoDirectory);
    }

    res.json("Success!");
  })
);

export default router;