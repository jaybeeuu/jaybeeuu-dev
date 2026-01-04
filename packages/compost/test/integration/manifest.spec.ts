import type { PostFile, TestPostFileMeta } from "./helpers.js";
import {
  cleanUpDirectories,
  compilePosts,
  getPostManifest,
  writePostFile,
} from "./helpers.js";

import path from "node:path";
import { advanceTo, clear } from "jest-date-mock";
import type { Response } from "node-fetch";
import fetch from "node-fetch";
import { writeJsonFile } from "../../src/files/index.js";

import { describe, expect, it, jest } from "@jest/globals";
jest.mock("node-fetch");

interface PostFileWithStringContent extends Omit<PostFile, "content"> {
  content: string;
}
interface PostFileWithStringArrayContent extends Omit<PostFile, "content"> {
  content: string[];
}

describe("manifest", () => {
  it("has an entry for a new post with the correct properties.", async () => {
    await cleanUpDirectories();

    const publishDate = "2020-03-11";
    advanceTo(publishDate);
    const slug = "first-post";
    const meta: TestPostFileMeta = {
      title: "This is the first post",
      abstract: "This is the very first post.",
      publish: true,
    };
    await writePostFile({
      slug,
      meta,
      content: ["# This is the first post", "", "It has some content."],
    });

    await compilePosts();

    const manifest = await getPostManifest();

    expect(manifest).toStrictEqual({
      version: 2,
      metadata: {
        generatedAt: expect.stringMatching(
          /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
        ) as unknown,
        entryCount: 1,
        overallHash: "x7KKZVvS1SM1S9yqff9gvKG5KqM",
      },
      entries: {
        [slug]: {
          title: meta.title,
          abstract: meta.abstract,
          fileName: expect.stringMatching(
            new RegExp(`${slug}-[A-z0-9]{6}.html`),
          ) as unknown,
          href: expect.stringMatching(
            new RegExp(`/posts/${slug}-[A-z0-9]{6}.html`),
          ) as unknown,
          hash: "lWR0ID14VxOeYmrBGIJ75jDhRA",
          stars: 0,
          contentLength: 46,
          lastUpdateDate: null,
          publishDate: new Date(publishDate).toISOString(),
          slug,
        },
      },
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
        publish: true,
      },
      content: ["# This is the first post", "", "It has some content."],
    });
    const hrefRoot = "posts";
    await compilePosts({ hrefRoot });

    const manifest = await getPostManifest();

    expect(manifest.entries[slug]?.href).toStrictEqual(
      expect.stringMatching(
        new RegExp(`/${hrefRoot}/${slug}-[A-z0-9]{6}.html`),
      ) as unknown,
    );
  });

  it("does not change publish date when a post is updated and recompiled, and compost has access to the old manifest.", async () => {
    await cleanUpDirectories();
    const slug = "first-post";
    const postFile: PostFileWithStringArrayContent = {
      slug,
      meta: {
        title: "This is the first post",
        abstract: "This is the very first post.",
        publish: true,
      },
      content: ["# This is the first post", "It has some content."],
    };
    await writePostFile(postFile);

    const publishDate = "2020-03-11";
    advanceTo(publishDate);
    await compilePosts();

    await writePostFile({
      ...postFile,
      content: [...postFile.content, "some new content"],
    });

    const updatedDate = "2020-03-12";
    advanceTo(updatedDate);
    await compilePosts();

    const manifest = await getPostManifest();

    expect(manifest.entries[slug]?.publishDate).toStrictEqual(
      new Date(publishDate).toISOString(),
    );
  });

  it("updates the lastUpdatedDate when a post is updated and recompiled, and compost has access to the old manifest.", async () => {
    await cleanUpDirectories();
    const slug = "first-post";
    const postFile: PostFileWithStringArrayContent = {
      slug,
      meta: {
        title: "This is the first post",
        abstract: "This is the very first post.",
        publish: true,
      },
      content: ["# This is the first post", "It has some content."],
    };

    await writePostFile(postFile);

    const publishDate = "2020-03-11";
    advanceTo(publishDate);

    await compilePosts();

    await writePostFile({
      ...postFile,
      content: [...postFile.content, "some new content"],
    });

    const updatedDate = "2020-03-12";
    advanceTo(updatedDate);

    await compilePosts();

    const manifest = await getPostManifest();

    expect(manifest.entries[slug]?.lastUpdateDate).toStrictEqual(
      new Date(updatedDate).toISOString(),
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
        publish: true,
      },
      content: "# This is the first post",
    });

    const publishDate = "2020-03-11";
    advanceTo(publishDate);
    await compilePosts();

    const updatedDate = "2020-03-12";
    advanceTo(updatedDate);
    await compilePosts();

    const manifest = await getPostManifest();

    expect(manifest.entries[slug]?.lastUpdateDate).toBeNull();
  });

  it("includes the lastUpdatedDate from the old manifest when a post is recompiled but not updated, and compost has access to the old manifest.", async () => {
    await cleanUpDirectories();
    const slug = "first-post";
    const postFile: PostFileWithStringContent = {
      slug,
      meta: {
        title: "This is the first post",
        abstract: "This is the very first post.",
        publish: true,
      },
      content: "# This is the first post",
    };
    await writePostFile(postFile);

    const publishDate = "2020-03-11";
    advanceTo(publishDate);
    await compilePosts();

    await writePostFile({
      ...postFile,
      content: [postFile.content, "some new content"],
    });

    const updatedDate = "2020-03-12";
    advanceTo(updatedDate);
    await compilePosts();

    advanceTo("2020-03-13");
    await compilePosts();

    const manifest = await getPostManifest();

    expect(manifest.entries[slug]?.lastUpdateDate).toStrictEqual(
      new Date(updatedDate).toISOString(),
    );
  });

  it("transforms old manifest data which are not in ISO format into ISO.", async () => {
    await cleanUpDirectories();
    clear(); // Reset mock date

    const slug = "first-post";
    const content = "# This is the first post";
    const meta = {
      title: "This is the first post",
      abstract: "This is the very first post.",
      publish: true,
    };

    await writePostFile({
      slug,
      meta,
      content,
    });

    // First compile to get the actual filenames and hashes that will be generated
    await compilePosts();
    const initialManifest = await getPostManifest();
    const actualFileName = initialManifest.entries[slug]?.fileName;

    // Clean up and start fresh
    await cleanUpDirectories();
    await writePostFile({
      slug,
      meta,
      content,
    });

    // Now create a V1 manifest (no hash field) with the correct filename but old date formats
    const v1Manifest = {
      [slug]: {
        fileName: actualFileName,
        lastUpdateDate: "Fri, 30 Jul 2021 20:18:43 GMT",
        publishDate: "Sun, 06 Jun 2021 22:08:34 GMT",
        href: `/posts/${actualFileName}`,
      },
    };
    // Write the V1 manifest directly to bypass type checking
    await writeJsonFile(
      path.join("out", "posts", "post-manifest.json"),
      v1Manifest,
    );

    await compilePosts();

    const manifest = await getPostManifest();

    expect(manifest.entries[slug]?.lastUpdateDate).toBe(
      "2021-07-30T20:18:43.000Z",
    );
    expect(manifest.entries[slug]?.publishDate).toBe(
      "2021-06-06T22:08:34.000Z",
    );
  });

  it("updates the lastUpdatedDate when the manifest needs to be fetched.", async () => {
    await cleanUpDirectories();
    const slug = "first-post";
    const postFile: PostFileWithStringContent = {
      slug,
      meta: {
        title: "This is the first post",
        abstract: "This is the very first post.",
        publish: true,
      },
      content: "# This is the first post",
    };
    await writePostFile(postFile);

    const oldManifestLocator = "https://www.old-manifest.com";
    await compilePosts({ oldManifestLocators: [oldManifestLocator] });
    const manifest = await getPostManifest();

    jest.mocked(fetch).mockResolvedValue({
      json: (): Promise<unknown> => {
        return Promise.resolve(manifest);
      },
    } as unknown as Response);

    await writePostFile({
      ...postFile,
      content: [postFile.content, "some new content"],
    });

    const updatedDate = "2020-03-12";
    advanceTo(updatedDate);
    await compilePosts({ oldManifestLocators: [oldManifestLocator] });

    expect(fetch).toHaveBeenCalledWith(oldManifestLocator);

    const newManifest = await getPostManifest();
    expect(newManifest.entries[slug]?.lastUpdateDate).toStrictEqual(
      new Date(updatedDate).toISOString(),
    );
  });

  it("updates the lastUpdatedDate when the manifest needs to be fetched from the first of several old manifest locations.", async () => {
    await cleanUpDirectories();
    const slug = "first-post";
    const postFile: PostFileWithStringContent = {
      slug,
      meta: {
        title: "This is the first post",
        abstract: "This is the very first post.",
        publish: true,
      },
      content: "# This is the first post",
    };
    await writePostFile(postFile);

    const oldManifestLocators = [
      "https://www.old-manifest.com",
      "https://www.new-old-manifest.com",
    ];
    await compilePosts({ oldManifestLocators });
    const manifest = await getPostManifest();

    jest.mocked(fetch).mockResolvedValue({
      json: (): Promise<unknown> => {
        return Promise.resolve(manifest);
      },
    } as unknown as Response);

    await writePostFile({
      ...postFile,
      content: [postFile.content, "some new content"],
    });

    const updatedDate = "2020-03-12";
    advanceTo(updatedDate);
    await compilePosts({ oldManifestLocators });

    const newManifest = await getPostManifest();
    expect(newManifest.entries[slug]?.lastUpdateDate).toStrictEqual(
      new Date(updatedDate).toISOString(),
    );
  });

  it("updates the lastUpdatedDate when the manifest needs to be fetched from the fallback.", async () => {
    await cleanUpDirectories();
    const slug = "first-post";
    const postFile: PostFileWithStringContent = {
      slug,
      meta: {
        title: "This is the first post",
        abstract: "This is the very first post.",
        publish: true,
      },
      content: "# This is the first post",
    };
    await writePostFile(postFile);

    const oldManifestLocators = [
      "https://www.old-manifest.com",
      "https://www.new-old-manifest.com",
    ];

    await compilePosts({ oldManifestLocators });
    const manifest = await getPostManifest();

    jest
      .mocked(fetch)
      .mockRejectedValueOnce(new Error("Whoops"))
      .mockResolvedValue({
        json: (): Promise<unknown> => {
          return Promise.resolve(manifest);
        },
      } as unknown as Response);

    await writePostFile({
      ...postFile,
      content: [postFile.content, "some new content"],
    });

    const updatedDate = "2020-03-12";
    advanceTo(updatedDate);
    await compilePosts({ oldManifestLocators });

    const newManifest = await getPostManifest();
    expect(newManifest.entries[slug]?.lastUpdateDate).toStrictEqual(
      new Date(updatedDate).toISOString(),
    );
  });

  it("fails to compost it manifest is not available and the require-old-manifest flag is set.", async () => {
    await cleanUpDirectories();
    await writePostFile({
      slug: "slug",
      meta: {
        title: "This is the first post",
        abstract: "This is the very first post.",
        publish: true,
      },
      content: ["# A Post"],
    });
    const result = await compilePosts({ requireOldManifest: true });

    expect(result.success).toBe(false);
  });

  it.each([
    {
      approach: "JSON file",
      metadataStyle: "json" as const,
      description: "uses traditional .post.json metadata file",
    },
    {
      approach: "front matter",
      metadataStyle: "frontmatter" as const,
      description: "uses YAML front matter in markdown file",
    },
  ])(
    "produces identical manifest entries when $approach $description",
    async ({ metadataStyle }) => {
      await cleanUpDirectories();

      const publishDate = "2023-05-20";
      advanceTo(publishDate);
      const slug = "test-post";
      const meta: TestPostFileMeta = {
        title: "Test Post Title",
        abstract: "This is a test post abstract.",
        publish: true,
      };

      await writePostFile({
        slug,
        meta,
        content: [
          "# Test Post Title",
          "",
          "This is test content for the post.",
        ],
        metadataStyle,
      });

      await compilePosts();

      const manifest = await getPostManifest();

      expect(manifest).toStrictEqual({
        version: 2,
        metadata: {
          generatedAt: expect.stringMatching(
            /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
          ) as unknown,
          entryCount: 1,
          overallHash: "T4Q3cjuEVWLsnd8IPIBfEECc",
        },
        entries: {
          [slug]: {
            title: meta.title,
            abstract: meta.abstract,
            fileName: expect.stringMatching(
              new RegExp(`${slug}-[A-z0-9]{6}.html`),
            ) as unknown,
            href: expect.stringMatching(
              new RegExp(`/posts/${slug}-[A-z0-9]{6}.html`),
            ) as unknown,
            hash: "UbwjWuXYLybAQRa7AxKPhsdbIo",
            lastUpdateDate: null,
            publishDate: new Date(publishDate).toISOString(),
            slug,
            stars: 0,
            contentLength: 53,
          },
        },
      });
    },
  );

  it.each([
    {
      metadataStyle: "json" as const,
      description: "JSON metadata",
    },
    {
      metadataStyle: "frontmatter" as const,
      description: "front matter metadata",
    },
  ])(
    "ignores posts when meta is null with $description",
    async ({ metadataStyle }) => {
      await cleanUpDirectories();

      const slug = "test-post-no-meta";

      await writePostFile({
        slug,
        meta: null,
        content: ["# Test Post", "", "This is test content."],
        metadataStyle,
      });

      const result = await compilePosts();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(Object.keys(result.value.entries)).toHaveLength(0);
      }
    },
  );
});
