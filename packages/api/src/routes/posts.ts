import express from "express";
import { withHandledErrors } from "./with-handled-errors";
import { getPostManifest } from "../posts/index";
import { resolvePostFilePath } from "../posts/src/file-paths";

const router = express.Router();

router.get(
  "/",
  async (request, response): Promise<void> => {
    response.json(await getPostManifest());
  }
);

router.get(
  "/:name",
  withHandledErrors((requesst, response): void => {
    const { name } = requesst.params;
    const postFilePath = resolvePostFilePath(name);
    response.sendFile(postFilePath, {
      dotfiles: "deny"
    });
  })
);

export default router;