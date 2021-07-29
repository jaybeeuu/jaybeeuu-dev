import type { PostFile } from "./helpers";
import {
  cleanUpDirectories,
  compilePosts,
  getPostManifest,
  writePostFile
} from "./helpers";

import { advanceTo } from "jest-date-mock";
import fetch from "node-fetch";
import { mocked } from "ts-jest/utils";
import type { PostMetaFileData } from "../../src/posts/src/metafile";

jest.mock("node-fetch");

describe("manifest", () => {
  it("has an entry for a new post with the correct properties.", async () => {
    await cleanUpDirectories();

    const publishDate = "2020-03-11";
    advanceTo(publishDate);
    const slug = "first-post";
    const meta: PostMetaFileData = {
      title: "This is the first post",
      abstract: "This is the very first post.",
      publish: true
    };
    await writePostFile({
      slug,
      meta,
      content: "# This is the first post\n\nIt has some content."
    });

    await compilePosts();

    const manifest = await getPostManifest();

    expect(manifest).toStrictEqual({
      [slug]: {
        ...meta,
        publishDate: new Date(publishDate).toISOString(),
        lastUpdateDate: null,
        slug,
        fileName: expect.stringMatching(new RegExp(`${slug}-[A-z0-9]{6}.html`)) as unknown,
        href: expect.stringMatching(new RegExp(`/posts/${slug}-[A-z0-9]{6}.html`)) as unknown
      }
    });
  });

  it("compiles the posts to the specified hrefRoot when one is supplied..", async () => {
    await cleanUpDirectories();
    const slug = "first-post";
    await writePostFile({
      slug,
      meta: {
        title: "This is the first post",
        abstract: "This is the very first post.",
        publish: true
      },
      content: "# This is the first post\n\nIt has some content."
    });
    const hrefRoot = "posts";
    await compilePosts({ hrefRoot });

    const manifest = await getPostManifest();

    expect(manifest[slug]?.href).toStrictEqual(
      expect.stringMatching(new RegExp(`/${hrefRoot}/${slug}-[A-z0-9]{6}.html`)) as unknown
    );
  });

  it("does not change publish date when a post is updated and recompiled, and compost has access to the old manifest.", async () => {
    await cleanUpDirectories();
    const slug = "first-post";
    const postFile: PostFile = {
      slug,
      meta: {
        title: "This is the first post",
        abstract: "This is the very first post.",
        publish: true
      },
      content: [
        "# This is the first post",
        "It has some content."
      ]
    };
    await writePostFile(postFile);

    const publishDate = "2020-03-11";
    advanceTo(publishDate);
    await compilePosts();

    await writePostFile({
      ...postFile,
      content: [
        ...postFile.content,
        "some new content"
      ]
    });

    const updatedDate = "2020-03-12";
    advanceTo(updatedDate);
    await compilePosts();

    const manifest = await getPostManifest();

    expect(manifest[slug]?.publishDate).toStrictEqual(
      new Date(publishDate).toISOString(),
    );
  });

  it("updates the lastUpdatedDate when a post is updated and recompiled, and compost has access to the old manifest.", async () => {
    await cleanUpDirectories();
    const slug = "first-post";
    const postFile: PostFile = {
      slug,
      meta: {
        title: "This is the first post",
        abstract: "This is the very first post.",
        publish: true
      },
      content: [
        "# This is the first post",
        "It has some content."
      ]
    };
    await writePostFile(postFile);

    const publishDate = "2020-03-11";
    advanceTo(publishDate);
    await compilePosts();

    await writePostFile({
      ...postFile,
      content: [
        ...postFile.content,
        "some new content"
      ]
    });

    const updatedDate = "2020-03-12";
    advanceTo(updatedDate);
    await compilePosts();

    const manifest = await getPostManifest();

    expect(manifest[slug]?.lastUpdateDate).toStrictEqual(
      new Date(updatedDate).toISOString()
    );
  });

  it("does not add an updated date if the post hsa not updated.", async () => {
    await cleanUpDirectories();
    const slug = "first-post";
    await writePostFile({
      slug,
      meta: {
        title: "This is the first post",
        abstract: "This is the very first post.",
        publish: true
      },
      content: [
        "# This is the first post",
        "It has some content."
      ]
    });

    const publishDate = "2020-03-11";
    advanceTo(publishDate);
    await compilePosts();

    const updatedDate = "2020-03-12";
    advanceTo(updatedDate);
    await compilePosts();

    const manifest = await getPostManifest();

    expect(manifest[slug]?.lastUpdateDate).toBeNull();
  });

  it("updates the lastUpdatedDate when the manifest needs to be fetched.", async () => {
    await cleanUpDirectories();
    const slug = "first-post";
    const postFile: PostFile = {
      slug,
      meta: {
        title: "This is the first post",
        abstract: "This is the very first post.",
        publish: true
      },
      content: [
        "# This is the first post",
        "It has some content."
      ]
    };
    await writePostFile(postFile);

    const oldManifestLocator = "https://www.oldManifest.com";
    await compilePosts({ oldManifestLocator });
    const manifest = await getPostManifest();

    mocked(fetch).mockImplementation(() => {
      return Promise.resolve({
        json: (): Promise<unknown> => {
          return Promise.resolve(manifest);
        }
      } as any);
    });

    await writePostFile({
      ...postFile,
      content: [
        ...postFile.content,
        "some new content"
      ]
    });

    const updatedDate = "2020-03-12";
    advanceTo(updatedDate);
    await compilePosts({ oldManifestLocator });

    expect(fetch).toHaveBeenCalledWith(oldManifestLocator);

    const newManifest = await getPostManifest();
    expect(newManifest[slug]?.lastUpdateDate).toStrictEqual(
      new Date(updatedDate).toISOString()
    );
  });

  it("fails to compost it manifest is not available and the require-old-manifest flag is set.", async () => {
    await cleanUpDirectories();
    await writePostFile({
      slug: "slug",
      meta: {
        title: "This is the first post",
        abstract: "This is the very first post.",
        publish: true
      },
      content: [ "# A Post"]
    });
    const result = await compilePosts({ requireOldManifest: true });

    expect(result.success).toBe(false);
  });
});
