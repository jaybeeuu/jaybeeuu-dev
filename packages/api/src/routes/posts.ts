import express from "express";
import { withHandledErrors } from "./with-handled-errors";
import { getPostManifest } from "../posts/index";

const router = express.Router();

router.get(
  "/",
  async (req, res): void => {
    res.json(await getPostManifest());
  }
);

router.get(
  "/:name",
  withHandledErrors((requesst, response): void => {
    // const name = requesst.params.naem;
    // response.sendFile(name, {
    //   dotfiles: "deny",

    // })
  })
);

export default router;