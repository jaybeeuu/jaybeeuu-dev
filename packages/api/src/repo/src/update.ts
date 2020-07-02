import fs from "fs";
import git from "simple-git/promise";
import { REMOTE_POST_REPO } from "../../env";
import { POSTS_REPO_DIRECTORY, resolveApp } from "../../paths";
import { canAccess } from "../../files/index";

export const update = async (): Promise<void> => {
  if (await canAccess(POSTS_REPO_DIRECTORY)) {
    await git(POSTS_REPO_DIRECTORY).pull();
  } else {
    const remoteRepoPath = resolveApp(REMOTE_POST_REPO);

    if (!await canAccess(remoteRepoPath)) {
      throw new Error(`Remote repo does not exist: ${remoteRepoPath}`);
    }

    await fs.promises.mkdir(POSTS_REPO_DIRECTORY, { recursive: true });
    try {
      await git(POSTS_REPO_DIRECTORY).clone(remoteRepoPath, POSTS_REPO_DIRECTORY);
    } catch (err) {
      await fs.promises.rmdir(POSTS_REPO_DIRECTORY, { recursive: true });
      throw err;
    }
  }
};