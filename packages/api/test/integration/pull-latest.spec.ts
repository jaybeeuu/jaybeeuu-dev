import "../mock-env";

import path from "path";
import { POSTS_REPO_DIRECTORY } from "../../src/paths";
import { fetch, Verbs } from "../fetch";
import { cleanUpDirectories, getFileHashes, FileHashMap, getRemoteRepoDirectory } from "../files";
import { useServer } from "../server";
import { makeRepo, makeCommit } from "../git";


const REMOTE_POST_REPO_DIRECTORY = getRemoteRepoDirectory();

const getRepoFileHashes = (directory: string): Promise<FileHashMap> => {
  return getFileHashes(directory, { exclude: [/.git/] });
};

describe("refresh", () => {
  useServer();

  it("updates the repo if it has already been cloned.", async () => {
    await cleanUpDirectories();
    await makeRepo(
      path.resolve(REMOTE_POST_REPO_DIRECTORY),
      [{
        message: "Make a post",
        files: [{
          path: "./first-post.md",
          content: "# This is the first post\n\nIt has some content."
        }]
      }]
    );

    await fetch("/refresh", { method: Verbs.POST });

    await makeCommit(
      path.resolve(REMOTE_POST_REPO_DIRECTORY),
      {
        message: "Make a post",
        files: [{
          path: "./first-post.md",
          content: "# This is the updated first post\n\nIt has some updated content."
        }]
      }
    );

    const response = await fetch("/refresh", { method: Verbs.POST })
      .then((res) => res.json());

    expect(response).toBe("Success!");

    expect(await getRepoFileHashes(POSTS_REPO_DIRECTORY))
      .toStrictEqual(await getRepoFileHashes(REMOTE_POST_REPO_DIRECTORY));
  });


  it("redirects a request for the previous version of a post to the updated one.", async () => {
    await cleanUpDirectories();
    const slug = "first-post";
    await makeRepo(
      path.resolve(REMOTE_POST_REPO_DIRECTORY),
      [{
        message: "Make a post",
        files: [{
          path: `./${slug}.md`,
          content: "# This is the first post\n\nIt has some content."
        }]
      }]
    );

    await fetch("/refresh", { method: Verbs.POST });

    const manifest = await fetch("/posts", { method: Verbs.GET })
      .then((res) => res.json());

    const updatedPostContent = "and it has been updated";
    await makeCommit(
      path.resolve(REMOTE_POST_REPO_DIRECTORY),
      {
        message: "Make a post",
        files: [{
          path: `./${slug}.md`,
          content: `# This is the updated first post\n\nIt has some content${updatedPostContent}.`
        }]
      }
    );

    await fetch("/refresh", { method: Verbs.POST });

    const response = await fetch(manifest[slug].href, { method: Verbs.GET });
    expect(response.redirected).toBe(true);

    const post = await response.text();

    expect(post).toContain(updatedPostContent);
  });
});