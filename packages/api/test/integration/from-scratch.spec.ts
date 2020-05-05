import "../mock-env";

import path from "path";
import { advanceTo } from "jest-date-mock";
import { fetch, Verbs, fetchOK } from "../fetch";
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
    const slug = "first-post";
    const meta = {
      title: "This is the first post",
      abstract: "This is the very first post."
    };
    await makeRepo(
      path.resolve(REMOTE_POST_REPO_DIRECTORY),
      [{
        message: "Make a post",
        files: [{
          path: `./${slug}.md`,
          content: "# This is the first post\n\nIt has some content."
        }, {
          path: `./${slug}.json`,
          content: JSON.stringify(meta, null, 2)
        }]
      }]
    );

    await fetchOK("/refresh", { method: Verbs.POST });

    const result = await fetch("/posts", { method: Verbs.GET })
      .then((res) => res.json());

    expect(result).toStrictEqual({
      [slug]: {
        ...meta,
        publishDate: new Date(publishDate).toUTCString(),
        lastUpdateDate: null,
        slug,
        fileName: expect.stringMatching(new RegExp(`${slug}-[A-z0-9]{6}.html`)),
        href: expect.stringMatching(new RegExp(`/posts/${slug}-[A-z0-9]{6}.html`))
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

    await fetchOK("/refresh", { method: Verbs.POST });

    const manifest = await fetch("/posts", { method: Verbs.GET })
      .then((res) => res.json());

    const post = await fetch(manifest[slug].href, { method: Verbs.GET,  })
      .then((res) => res.text());

    expect(post).toContain(postContent);
  });
});