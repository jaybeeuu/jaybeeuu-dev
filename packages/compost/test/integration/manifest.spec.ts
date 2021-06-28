import type {
  PostFile} from "./helpers";
import {
  compilePosts,
  getPostManifest,
  outputDir,
  sourceDir,
  writePostFiles
} from "./helpers";

import { advanceTo } from "jest-date-mock";
import fetch from "node-fetch";
import { mocked } from "ts-jest/utils";

import {
  deleteDirectories,
} from "../../src/files/index";
import type { PostMetaFileData } from "../../src/posts/src/metafile";

jest.mock("node-fetch");

describe("manifest", () => {
  it("has an entry for a new post with the correct properties.", async () => {
    await deleteDirectories(sourceDir, outputDir);

    const publishDate = "2020-03-11";
    advanceTo(publishDate);
    const slug = "first-post";
    const meta: PostMetaFileData = {
      title: "This is the first post",
      abstract: "This is the very first post.",
      publish: true
    };
    await writePostFiles({
      slug,
      meta,
      content: "# This is the first post\n\nIt has some content."
    });

    await compilePosts();

    const manifest = await getPostManifest();

    expect(manifest).toStrictEqual({
      [slug]: {
        ...meta,
        publishDate: new Date(publishDate).toUTCString(),
        lastUpdateDate: null,
        slug,
        fileName: expect.stringMatching(new RegExp(`${slug}-[A-z0-9]{6}.html`)) as unknown,
        href: expect.stringMatching(new RegExp(`/posts/${slug}-[A-z0-9]{6}.html`)) as unknown
      }
    });
  });

  it("compiles the posts to the specified hrefRoot when one is supplied..", async () => {
    await deleteDirectories(sourceDir, outputDir);

    const slug = "first-post";
    await writePostFiles({
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

    expect(manifest[slug].href).toStrictEqual(
      expect.stringMatching(new RegExp(`/${hrefRoot}/${slug}-[A-z0-9]{6}.html`)) as unknown
    );
  });

  it("does not change publish date when a post is updated and recompiled, and compost has access to the old manifest.", async () => {
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
    await writePostFiles(postFile);

    const publishDate = "2020-03-11";
    advanceTo(publishDate);
    await compilePosts();

    await writePostFiles({
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

    expect(manifest[slug].publishDate).toStrictEqual(
      new Date(publishDate).toUTCString(),
    );
  });

  it("updates the lastUpdatedDate when a post is updated and recompiled, and compost has access to the old manifest.", async () => {
    await deleteDirectories(sourceDir, outputDir);

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
    await writePostFiles(postFile);

    const publishDate = "2020-03-11";
    advanceTo(publishDate);
    await compilePosts();

    await writePostFiles({
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

    expect(manifest[slug].lastUpdateDate).toStrictEqual(
      new Date(updatedDate).toUTCString()
    );
  });

  it("does not add an updated date if the post hsa not updated.", async () => {
    await deleteDirectories(sourceDir, outputDir);

    const slug = "first-post";
    await writePostFiles({
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

    expect(manifest[slug].lastUpdateDate).toBeNull();
  });

  it("updates the lastUpdatedDate when the manifest needs to be fetched.", async () => {
    await deleteDirectories(sourceDir, outputDir);

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
    await writePostFiles(postFile);

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

    await writePostFiles({
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
    expect(newManifest[slug].lastUpdateDate).toStrictEqual(
      new Date(updatedDate).toUTCString()
    );
  });
});
