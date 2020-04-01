import express from "express";
import { withHandledErrors } from "./with-handled-errors";
import * as repo from "../repo/index";
import * as posts from "../posts/index";

const router = express.Router();

router.post(
  "/",
  withHandledErrors(async (req, res): Promise<void> => {
    await repo.update();
    await posts.update();
    res.json("Success!");
  })
);

export default router;