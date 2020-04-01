import fs from "fs";
import git from "simple-git/promise";
import { REMOTE_POST_REPO } from "../../env";
import { POST_REPO_DIRECTORY, resolveApp } from "../../paths";
import { canAccess } from "../../files/index";

export const update = async (): Promise<void> => {
  if (await canAccess(POST_REPO_DIRECTORY)) {
    await git(POST_REPO_DIRECTORY).pull();
  } else {
    await fs.promises.mkdir(POST_REPO_DIRECTORY, { recursive: true });
    await git(POST_REPO_DIRECTORY).clone(resolveApp(REMOTE_POST_REPO), POST_REPO_DIRECTORY);
  }
};