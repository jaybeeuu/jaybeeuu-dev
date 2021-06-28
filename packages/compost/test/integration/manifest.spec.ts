import {
  compilePosts,
  getPostManifest,
  outputDir,
  sourceDir,
  writePostFiles
} from "./helpers";

import { advanceTo } from "jest-date-mock";
import {
  deleteDirectories,
  writeTextFiles
} from "../../src/files/index";
import type { PostMetaFileData } from "../../src/posts/src/metafile";

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
    const hrefRoot = "posts";
    await compilePosts({ hrefRoot });

    const manifest = await getPostManifest();

    expect(manifest).toStrictEqual({
      [slug]: {
        ...meta,
        publishDate: new Date(publishDate).toUTCString(),
        lastUpdateDate: null,
        slug,
        fileName: expect.stringMatching(new RegExp(`${slug}-[A-z0-9]{6}.html`)) as unknown,
        href: expect.stringMatching(new RegExp(`/${hrefRoot}/${slug}-[A-z0-9]{6}.html`)) as unknown
      }
    });
  });

  it("has an entry for each new post with the correct properties.", async () => {
    await deleteDirectories(sourceDir, outputDir);

    const publishDate = "2020-03-11";
    advanceTo(publishDate);
    const slug = "first-post";
    const meta: PostMetaFileData = {
      title: "This is the first post",
      abstract: "This is the very first post.",
      publish: true
    };
    await writeTextFiles(
      sourceDir,
      [{
        path: `./${slug}.md`,
        content: "# This is the first post\n\nIt has some content."
      }, {
        path: `./${slug}.post.json`,
        content: JSON.stringify(meta, null, 2)
      }]
    );
    const hrefRoot = "posts";
    await compilePosts({ hrefRoot });

    const manifest = await getPostManifest();

    expect(manifest).toStrictEqual({
      [slug]: {
        ...meta,
        publishDate: new Date(publishDate).toUTCString(),
        lastUpdateDate: null,
        slug,
        fileName: expect.stringMatching(new RegExp(`${slug}-[A-z0-9]{6}.html`)) as unknown,
        href: expect.stringMatching(new RegExp(`/${hrefRoot}/${slug}-[A-z0-9]{6}.html`)) as unknown
      }
    });
  });
});
