import fs from "fs";
import path from "path";
import git from "simple-git/promise";
import { POST_REPO_USER_NAME, POST_REPO_USER_EMAIL } from "../src/env";
import { writeTextFile, deleteFile } from "../src/files/index";

export interface File {
  path: string,
  content: string | null
}

export interface Commit {
  message: string;
  files: File[];
}

export interface Repo {
  path: string;
  commits: Commit[];
}

export const makeCommit = async (
  repoPath: string,
  { message, files }: Commit
): Promise<void> => {
  for(const { path: filePath, content } of files) {
    const resolvedFilePath = path.resolve(repoPath, filePath);
    if (content === null) {
      await deleteFile(resolvedFilePath);
    } else {
      await writeTextFile(
        resolvedFilePath,
        content
      );
    }
    await git(repoPath).add(resolvedFilePath);
  }
  await git(repoPath).commit(message);
};

export const makeRepo = async (
  repoPath: string,
  commits: Commit[]
): Promise<void> => {
  await fs.promises.mkdir(repoPath, { recursive: true });
  await git(repoPath)
    .init();
  git(repoPath).addConfig("user.name", POST_REPO_USER_NAME);
  git(repoPath).addConfig("user.email", POST_REPO_USER_EMAIL);

  for (let commitIndex = 0; commitIndex < commits.length; commitIndex++) {
    const commit = commits[commitIndex];
    await makeCommit(repoPath, commit);
  }
};
