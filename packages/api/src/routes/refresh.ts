import express from "express";
import { Clone } from "nodegit";
import { postRepoDirectory } from "../paths";
import { REMOTE_POST_REPO } from "../env";
const router = express.Router();

router.post(
  "/",
  (req, res): void => {
    Clone.clone(
      REMOTE_POST_REPO,
      postRepoDirectory,
      {}
    );
    res.json("Success!");
  }
);

export default router;