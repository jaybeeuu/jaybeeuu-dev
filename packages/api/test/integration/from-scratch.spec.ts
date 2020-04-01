import "../mock-env";

import path from "path";
import { POST_REPO_DIRECTORY } from "../../src/paths";
import { fetch, Verbs } from "../fetch";
import { cleanUpDirectories, getFileHashes, FileHashMap, getRemoteRepoDirectory } from "../files";
import { useServer } from "../server";
import { makeRepos } from "../git";

const REMOTE_POST_REPO_DIRECTORY = getRemoteRepoDirectory();

const getRepoFileHashes = (directory: string): Promise<FileHashMap> => {
  return getFileHashes(directory, { exclude: [/.git/] });
};

describe("refresh", () => {
  useServer();
  it("clones the repo if one does not already exist.", async () => {
    await cleanUpDirectories();
    await makeRepos(
      {
        path: REMOTE_POST_REPO_DIRECTORY,
        commits: [{
          message: "Make a post",
          files: [{
            path: "./first-post.md",
            content: "# This is the first post\n\nIt has some content."
          }]
        }]
      }
    );

    const response = await fetch("/refresh", { method: Verbs.POST })
      .then((res) => res.json());

    expect(response).toBe("Success!");

    // TODO: Won't need this once testing other end points.
    expect(await getRepoFileHashes(POST_REPO_DIRECTORY))
      .toStrictEqual(await getRepoFileHashes(REMOTE_POST_REPO_DIRECTORY));
  });

  it("makes the posts available, after a refresh from a blank slate.", async () => {
    await cleanUpDirectories();
    await makeRepos(
      {
        path: path.resolve(REMOTE_POST_REPO_DIRECTORY),
        commits: [{
          message: "Make a post",
          files: [{
            path: "./first-post.md",
            content: "# This is the first post\n\nIt has some content."
          }]
        }]
      }
    );

    await fetch("/refresh", { method: Verbs.POST });

    const result = await fetch("/posts", { method: Verbs.GET })
      .then((res) => res.json());

    expect(result).toStrictEqual([
      {
        title: "First Post",
        slug: "first-post",
        date: "2020-03-31",
        href: expect.any(String)
      }
    ]);
  });
});