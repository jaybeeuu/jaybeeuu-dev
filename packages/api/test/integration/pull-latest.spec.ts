import "../mock-env";

import path from "path";
import { fetch, Verbs } from "../fetch";
import { cleanUpDirectories, getRemoteRepoDirectory } from "../files";
import { useServer } from "../server";
import { makeRepo, makeCommit } from "../git";

const REMOTE_POST_REPO_DIRECTORY = getRemoteRepoDirectory();

describe("refresh", () => {
  useServer();

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
        }, {
          path: `./${slug}.json`,
          content: JSON.stringify({
            title: "This is the first post",
            publishDate: "2020-03-11",
            lastUpdateDate: "2020-03-11",
            abstract: "This is the very first post."
          }, null, 2)
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

  it("does not redirect a request for a post that has not been updated.", async () => {
    await cleanUpDirectories();
    const slug = "first-post";
    const content = "It has some content.";
    await makeRepo(
      path.resolve(REMOTE_POST_REPO_DIRECTORY),
      [{
        message: "Make a post",
        files: [{
          path: `./${slug}.md`,
          content: `# This is the first post\n\n${content}`
        }, {
          path: `./${slug}.json`,
          content: JSON.stringify({
            title: "This is the first post",
            publishDate: "2020-03-11",
            lastUpdateDate: "2020-03-11",
            abstract: "This is the very first post."
          }, null, 2)
        }]
      }]
    );

    await fetch("/refresh", { method: Verbs.POST });

    const manifest = await fetch("/posts", { method: Verbs.GET })
      .then((res) => res.json());

    await makeCommit(
      path.resolve(REMOTE_POST_REPO_DIRECTORY),
      {
        message: "Make another post",
        files: [{
          path: `./${slug}-other.md`,
          content: "# This is another post\n\nIt has some different content."
        }, {
          path: `./${slug}-other.json`,
          content: JSON.stringify({
            title: "This is another post",
            publishDate: "2020-03-12",
            lastUpdateDate: "2020-03-12",
            abstract: "This is the second post."
          }, null, 2)
        }]
      }
    );

    await fetch("/refresh", { method: Verbs.POST });

    const response = await fetch(manifest[slug].href, { method: Verbs.GET });
    expect(response.redirected).toBe(false);

    const post = await response.text();

    expect(post).toContain(content);
  });
});