import { REMOTE_POST_REPO_DIRECTORY,  } from "../../../../test/mock-env";

import path from "path";
import { postRepoDirectory } from "../../../paths";
import { fetch, Verbs } from "../../../../test/fetch";
import { cleanUpDirectories, setupDirectories, getFileHashes, FileHashMap } from "../../../../test/files";
import { useServer } from "../../../../test/server";

const getRepoFileHashes = (directory: string): Promise<FileHashMap> => {
  return getFileHashes(directory, { exclude: [/.git/] });
};

describe("refresh", () => {
  useServer();

  it("clones the repo if one does not already exist.", async () => {
    await cleanUpDirectories();
    const testFiles = path.join(__dirname, "test-files/no-local-repo");
    await setupDirectories(testFiles);

    const response = await fetch("/refresh", { method: Verbs.POST })
      .then((response) => response.json());

    expect(response).toBe("Success!");

    expect(await getRepoFileHashes(postRepoDirectory))
      .toStrictEqual(await getRepoFileHashes(REMOTE_POST_REPO_DIRECTORY));
  });

  it("updates the repo if it has alread been cloend.", async () => {
    await cleanUpDirectories();
    const testFiles = path.join(__dirname, "test-files/local-repo-1-behind");
    await setupDirectories(testFiles);

    const response = await fetch("/refresh", { method: Verbs.POST })
      .then((response) => response.json());

    expect(response).toBe("Success!");

    expect(await getRepoFileHashes(postRepoDirectory))
      .toStrictEqual(await getRepoFileHashes(REMOTE_POST_REPO_DIRECTORY));
  });
});