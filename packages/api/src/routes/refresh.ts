import express from "express";
import { withHandledErrors } from "./with-handled-errors";
import * as repo from "../repo/index";
import * as posts from "../posts/index";
import { ResultState } from "../results";

const router = express.Router();

router.post(
  "/",
  withHandledErrors(async (req, res): Promise<void> => {
    await repo.update();
    const updateResult = await posts.update();
    if (updateResult.state === ResultState.failure) {
      res.statusCode = 500;
      res.json({
        message: updateResult.message
      });
    }
    res.json("Success!");
  })
);

export default router;