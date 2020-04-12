import express from "express";
import { withHandledErrors } from "./with-handled-errors";
import { getPostManifest } from "../posts/index";
import { resolvePostFilePath } from "../posts/src/file-paths";
import { PostRedirectsMap, getPostRedirects } from "../posts/src/redirects";

const router = express.Router();

router.get(
  "/",
  async (request, response): Promise<void> => {
    const manifest = await getPostManifest();
    response.json(manifest);
  }
);

const resolveRedirect = (name: string, redirects: PostRedirectsMap): string => {
  if (redirects[name]) {
    return resolveRedirect(redirects[name], redirects);
  }
  return name;
};

router.get(
  "/:name",
  withHandledErrors(async (request, response): Promise<void> => {
    const { name } = request.params;
    const redirectedName = resolveRedirect(name, await getPostRedirects());

    if (redirectedName !== name) {
      response.redirect(301, `/posts/${redirectedName}`);
      return;
    }

    const postFilePath = resolvePostFilePath(name);
    response.sendFile(postFilePath, {
      dotfiles: "deny"
    });
  })
);

export default router;