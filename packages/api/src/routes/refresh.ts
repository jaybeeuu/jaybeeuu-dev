import express from "express";
import { withHandledErrors } from "./with-handled-errors";
import { update as updateRepo } from "../repo/index";
import { update as updatePosts } from "../posts/index";
import { ResultState } from "../results";
import { allowCors } from "../cors";
import { HttpMethod } from "../http-constants";

const router = express.Router();

router.post(
  "/",
  allowCors({ methods: [HttpMethod.GET] }),
  withHandledErrors(async (req, res): Promise<void> => {
    await updateRepo();
    const updateResult = await updatePosts();
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