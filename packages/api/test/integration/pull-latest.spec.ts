import "../mock-env";

import path from "path";
import { fetch, Verbs } from "../fetch";
import { cleanUpDirectories, getRemoteRepoDirectory } from "../files";
import { useServer } from "../server";
import { makeRepo, makeCommit } from "../git";
import { advanceTo } from "jest-date-mock";

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

  it("sets the updatedDate if the content has changed.", async () => {
    await cleanUpDirectories();
    const slug = "first-post";
    await makeRepo(
      path.resolve(REMOTE_POST_REPO_DIRECTORY),
      [{
        message: "Make a post",
        files: [{
          path: `./${slug}.md`,
          content: "# This is the first post\n\nHas some content."
        }, {
          path: `./${slug}.json`,
          content: JSON.stringify({
            title: "This is the first post",
            abstract: "This is the very first post."
          }, null, 2)
        }]
      }]
    );

    await fetch("/refresh", { method: Verbs.POST });

    await makeCommit(
      path.resolve(REMOTE_POST_REPO_DIRECTORY),
      {
        message: "Update the post",
        files: [{
          path: `./${slug}.md`,
          content: "# This is the first post\n\nIt has some different content."
        }]
      }
    );

    const updateDate = "2020-03-11";
    advanceTo(updateDate);

    await fetch("/refresh", { method: Verbs.POST });

    const manifest = await fetch("/posts", { method: Verbs.GET })
      .then((res) => res.json());
    expect(manifest[slug].lastUpdateDate).toBe(new Date(updateDate).toUTCString());
  });

  it("returns the updated content from the new post.", async () => {
    await cleanUpDirectories();
    const slug = "first-post";
    await makeRepo(
      path.resolve(REMOTE_POST_REPO_DIRECTORY),
      [{
        message: "Make a post",
        files: [{
          path: `./${slug}.md`,
          content: "# This is the first post\n\nHas some content."
        }, {
          path: `./${slug}.json`,
          content: JSON.stringify({
            title: "This is the first post",
            abstract: "This is the very first post."
          }, null, 2)
        }]
      }]
    );

    await fetch("/refresh", { method: Verbs.POST });
    const newContent = "It has some different content";
    await makeCommit(
      path.resolve(REMOTE_POST_REPO_DIRECTORY),
      {
        message: "Update the post",
        files: [{
          path: `./${slug}.md`,
          content: `# This is the first post\n\n${newContent}.`
        }]
      }
    );

    await fetch("/refresh", { method: Verbs.POST });

    const manifest = await fetch("/posts", { method: Verbs.GET })
      .then((res) => res.json());

    const response = await fetch(manifest[slug].href, { method: Verbs.GET });
    const post = await response.text();

    expect(post).toContain(newContent);
  });

  it("updates to the meta are reflected in the manifest.", async () => {
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
            abstract: "This is the very first post."
          }, null, 2)
        }]
      }]
    );

    const publishDate = "2020-03-11";
    advanceTo(publishDate);

    await fetch("/refresh", { method: Verbs.POST });

    const manifest = await fetch("/posts", { method: Verbs.GET })
      .then((res) => res.json());

    const newMeta = {
      title: "This is the updated first post",
      abstract: "This is the an updated first post."
    };
    await makeCommit(
      path.resolve(REMOTE_POST_REPO_DIRECTORY),
      {
        message: "Make a post",
        files: [{
          path: `./${slug}.json`,
          content: JSON.stringify(newMeta, null, 2)
        }]
      }
    );

    const updateDate = "2020-03-11";
    advanceTo(updateDate);

    await fetch("/refresh", { method: Verbs.POST });

    const newManifest = await fetch("/posts", { method: Verbs.GET })
      .then((res) => res.json());

    expect(newManifest).toStrictEqual({
      [slug]: {
        ...newMeta,
        publishDate: new Date(publishDate).toUTCString(),
        lastUpdateDate: null,
        slug,
        fileName: manifest[slug].fileName,
        href: manifest[slug].href
      }
    });
  });
});