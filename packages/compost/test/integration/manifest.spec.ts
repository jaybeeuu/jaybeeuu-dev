import type { PostFile } from "./helpers";
import { writeOutputManifestFile as baseWriteOutputManifestFile } from "./helpers";
import {
  cleanUpDirectories,
  compilePosts,
  getPostManifest,
  writePostFile,
} from "./helpers";

import { advanceTo } from "jest-date-mock";
import type { Response } from "node-fetch";
import fetch from "node-fetch";
import type { PostManifest, PostMetaData } from "../../src/index";
import type { PostMetaFileData } from "../../src/posts/src/metafile";
import readingTime from "reading-time";

jest.mock("node-fetch");

const writeOutputManifestFile = (
  metaData: Pick<PostMetaData, "slug"> & Partial<Omit<PostMetaData, "slug">>,
): Promise<void> => {
  const defaultedManifest: PostManifest = {
    [metaData.slug]: {
      title: "{title}",
      abstract: "{abstract}",
      publish: false,
      publishDate: "Fri, 30 Jul 2021 20:18:43 GMT",
      lastUpdateDate: "Sun, 06 Jun 2021 22:08:34 GMT",
      fileName: "{fileName}",
      href: "{href}",
      readingTime: { minutes: 1, words: 1, text: "1 min read", time: 60000 },
      ...metaData,
      slug: metaData.slug,
    },
  };

  return baseWriteOutputManifestFile(defaultedManifest);
};

describe("manifest", () => {
  it("has an entry for a new post with the correct properties.", async () => {
    await cleanUpDirectories();

    jest.mocked(readingTime).mockReturnValue({
      minutes: 20,
      text: "{reading time}",
      time: 120000,
      words: 10,
    });

    const publishDate = "2020-03-11";
    advanceTo(publishDate);
    const slug = "first-post";
    const meta: PostMetaFileData = {
      title: "This is the first post",
      abstract: "This is the very first post.",
      publish: true,
    };
    await writePostFile({
      slug,
      meta,
      content: "# This is the first post\n\nIt has some content.",
    });

    await compilePosts();

    const manifest = await getPostManifest();

    expect(manifest).toStrictEqual({
      [slug]: {
        ...meta,
        fileName: expect.stringMatching(
          new RegExp(`${slug}-[A-z0-9]{6}.html`),
        ) as unknown,
        href: expect.stringMatching(
          new RegExp(`/posts/${slug}-[A-z0-9]{6}.html`),
        ) as unknown,
        lastUpdateDate: null,
        publishDate: new Date(publishDate).toISOString(),
        readingTime: {
          minutes: 20,
          text: "{reading time}",
          time: 120000,
          words: 10,
        },
        slug,
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
      content: "# This is the first post\n\nIt has some content.",
    });
    const hrefRoot = "posts";
    await compilePosts({ hrefRoot });

    const manifest = await getPostManifest();

    expect(manifest[slug]?.href).toStrictEqual(
      expect.stringMatching(
        new RegExp(`/${hrefRoot}/${slug}-[A-z0-9]{6}.html`),
      ) as unknown,
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

    expect(manifest[slug]?.lastUpdateDate).toStrictEqual(
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

    expect(manifest[slug]?.lastUpdateDate).toBeNull();
  });

  it("includes the lastUpdatedDate from the old manifest when a post is recompiled but not updated, and compost has access to the old manifest.", async () => {
    await cleanUpDirectories();
    const slug = "first-post";
    const postFile: PostFile = {
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
      content: [...postFile.content, "some new content"],
    });

    const updatedDate = "2020-03-12";
    advanceTo(updatedDate);
    await compilePosts();

    advanceTo("2020-03-13");
    await compilePosts();

    const manifest = await getPostManifest();

    expect(manifest[slug]?.lastUpdateDate).toStrictEqual(
      new Date(updatedDate).toISOString(),
    );
  });

  it("transforms old manifest data which are not in ISO format into ISO.", async () => {
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
    await writeOutputManifestFile({
      fileName: "first-post-ulvbV2.html",
      lastUpdateDate: "Fri, 30 Jul 2021 20:18:43 GMT",
      publishDate: "Sun, 06 Jun 2021 22:08:34 GMT",
      slug,
    });

    await compilePosts();

    const manifest = await getPostManifest();

    expect(manifest[slug]?.lastUpdateDate).toBe("2021-07-30T20:18:43.000Z");
    expect(manifest[slug]?.publishDate).toBe("2021-06-06T22:08:34.000Z");
  });

  it("updates the lastUpdatedDate when the manifest needs to be fetched.", async () => {
    await cleanUpDirectories();
    const slug = "first-post";
    const postFile: PostFile = {
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
      content: [...postFile.content, "some new content"],
    });

    const updatedDate = "2020-03-12";
    advanceTo(updatedDate);
    await compilePosts({ oldManifestLocators: [oldManifestLocator] });

    expect(fetch).toHaveBeenCalledWith(oldManifestLocator);

    const newManifest = await getPostManifest();
    expect(newManifest[slug]?.lastUpdateDate).toStrictEqual(
      new Date(updatedDate).toISOString(),
    );
  });

  it("updates the lastUpdatedDate when the manifest needs to be fetched from the first of several old manifest locations.", async () => {
    await cleanUpDirectories();
    const slug = "first-post";
    const postFile: PostFile = {
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
      content: [...postFile.content, "some new content"],
    });

    const updatedDate = "2020-03-12";
    advanceTo(updatedDate);
    await compilePosts({ oldManifestLocators });

    const newManifest = await getPostManifest();
    expect(newManifest[slug]?.lastUpdateDate).toStrictEqual(
      new Date(updatedDate).toISOString(),
    );
  });

  it("updates the lastUpdatedDate when the manifest needs to be fetched from the fallback.", async () => {
    await cleanUpDirectories();
    const slug = "first-post";
    const postFile: PostFile = {
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
      content: [...postFile.content, "some new content"],
    });

    const updatedDate = "2020-03-12";
    advanceTo(updatedDate);
    await compilePosts({ oldManifestLocators });

    const newManifest = await getPostManifest();
    expect(newManifest[slug]?.lastUpdateDate).toStrictEqual(
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
});
