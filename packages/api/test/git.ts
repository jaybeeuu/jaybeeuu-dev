import fs from "fs";
import path from "path";
import git from "simple-git/promise";
import { POST_REPO_USER_NAME, POST_REPO_USER_EMAIL } from "../src/env";

export interface File {
  path: string,
  content: string
}

export interface Commit {
  message: string;
  files: File[];
}

export const UP_TO_DATE: "up-to-date" = "up-to-date";

export type Status = typeof UP_TO_DATE | {
  behind: number;
  commitsAhead?: Commit[];
} | {
  behind?: number;
  commitsAhead: Commit[];
};

export interface DownstreamRepo {
  path: string;
  status: Status;
}

export interface Repo {
  path: string;
  commits: Commit[];
}

const makeCommit = async (
  repoPath: string,
  { message, files }: Commit
): Promise<void> => {
  for(const { path: filePath, content } of files) {
    const resolvedFilePath = path.resolve(repoPath, filePath);
    await fs.promises.writeFile(
      resolvedFilePath,
      content,
      { encoding: "utf8" }
    );
    await git(repoPath).add(resolvedFilePath);
  }
  await git(repoPath).commit(message);
};

const getCommitIndexToCloneDownStream = (
  commitCount: number,
  downsStreamStatus?: Status
): number => {
  if (!downsStreamStatus) {
    return -1;
  }

  const lastUpstreamCommitIndex = commitCount -1;
  return downsStreamStatus === UP_TO_DATE
    ? lastUpstreamCommitIndex
    : lastUpstreamCommitIndex - (downsStreamStatus.behind || 0);
};

const cloneDownStream = async (
  repoPath: string,
  { path: downStreamPath, status }: DownstreamRepo
): Promise<void> => {
  await git(downStreamPath).clone(repoPath);

  if (status !== UP_TO_DATE && status.commitsAhead) {
    git(repoPath).addConfig("user.name", POST_REPO_USER_NAME);
    git(repoPath).addConfig("user.email", POST_REPO_USER_EMAIL);

    for (const commit of status.commitsAhead) {
      await makeCommit(downStreamPath, commit);
    }
  }
};

export const makeRepos = async (
  { path: repoPath, commits }: Repo,
  downStream?: DownstreamRepo
): Promise<void> => {
  await fs.promises.mkdir(repoPath, { recursive: true });
  await git(repoPath)
    .init();
  git(repoPath).addConfig("user.name", POST_REPO_USER_NAME);
  git(repoPath).addConfig("user.email", POST_REPO_USER_EMAIL);

  const cloneRpoAtIndex = getCommitIndexToCloneDownStream(commits.length, downStream?.status);

  for (let commitIndex = 0; commitIndex < commits.length; commitIndex++) {
    const commit = commits[commitIndex];
    await makeCommit(repoPath, commit);

    if (downStream && commitIndex === cloneRpoAtIndex) {
      await cloneDownStream(repoPath, downStream);
    }
  }
};
