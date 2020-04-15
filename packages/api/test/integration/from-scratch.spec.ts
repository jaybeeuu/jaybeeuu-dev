import "../mock-env";

import path from "path";
import { advanceTo } from "jest-date-mock";
import { fetch, Verbs } from "../fetch";
import { cleanUpDirectories, getRemoteRepoDirectory } from "../files";
import { useServer } from "../server";
import { makeRepo } from "../git";

const REMOTE_POST_REPO_DIRECTORY = getRemoteRepoDirectory();

describe("refresh", () => {
  useServer();

  it("makes the post available in the manifest on /post, after a refresh from a blank slate.", async () => {
    await cleanUpDirectories();

    const publishDate = "2020-03-11";
    advanceTo(publishDate);

    const meta = {
      title: "This is the first post",
      abstract: "This is the very first post."
    };
    await makeRepo(
      path.resolve(REMOTE_POST_REPO_DIRECTORY),
      [{
        message: "Make a post",
        files: [{
          path: "./first-post.md",
          content: "# This is the first post\n\nIt has some content."
        }, {
          path: "./first-post.json",
          content: JSON.stringify(meta, null, 2)
        }]
      }]
    );

    await fetch("/refresh", { method: Verbs.POST });

    const result = await fetch("/posts", { method: Verbs.GET })
      .then((res) => res.json());

    expect(result).toStrictEqual({
      "first-post": {
        ...meta,
        publishDate: new Date(publishDate).toUTCString(),
        lastUpdateDate: null,
        slug: "first-post",
        fileName: expect.stringMatching(/[a-fA-F0-9]{40}\.html/),
        href: expect.stringMatching(/\/posts\/[a-fA-F0-9]{40}\.html/)
      }
    });
  });

  it("makes the posts available, after a refresh from a blank slate.", async () => {
    await cleanUpDirectories();

    const slug = "first-post";
    const postContent = "It has some content";
    await makeRepo(
      path.resolve(REMOTE_POST_REPO_DIRECTORY),
      [{
        message: "Make a post",
        files: [{
          path:`./${slug}.md`,
          content: `# This is the first post\n\n${postContent}.`
        }, {
          path: "./first-post.json",
          content: JSON.stringify({
            title: "This is the first post",
            abstract: "This is the very first post."
          }, null, 2)
        }]
      }]
    );

    await fetch("/refresh", { method: Verbs.POST });

    const manifest = await fetch("/posts", { method: Verbs.GET })
      .then((res) => res.json());

    const post = await fetch(manifest[slug].href, { method: Verbs.GET,  })
      .then((res) => res.text());

    expect(post).toContain(postContent);
  });
});