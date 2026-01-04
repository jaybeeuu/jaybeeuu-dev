import { advanceTo, clear } from "jest-date-mock";
import {
  cleanUpDirectories,
  compilePosts,
  getPostManifest,
  writePostFile,
  type PostFile,
} from "./helpers.js";
import { writeJsonFile } from "../../src/files/index.js";
import path from "path";
import type { OldManifestEntries } from "../../src/content/services/manifest/old-manifest.js";

interface PostFileWithStringArrayContent extends Omit<PostFile, "content"> {
  content: string[];
}

describe("manifest versioning compatibility", () => {
  beforeEach(() => {
    clear();
  });

  it("does not update a file where the V1 manifest indicates the post has never changed - assumes no change.", async () => {
    await cleanUpDirectories();

    const legacyManifest: OldManifestEntries = {
      post: {
        fileName: "post-CHANGE.html",
        publishDate: "2020-01-01T10:00:00.000Z",
        lastUpdateDate: null,
        hash: undefined,
      },
    };

    await writeJsonFile(
      path.resolve("out/posts/post-manifest.json"),
      legacyManifest,
    );

    const newDate = "2020-02-01";
    advanceTo(newDate);

    const newPost: PostFileWithStringArrayContent = {
      slug: "post",
      meta: {
        title: "First Post",
        abstract: "First abstract",
        publish: true,
      },
      content: ["# First Post", "This is UPDATED content for the first post."],
    };

    await writePostFile(newPost);

    const result = await compilePosts();
    expect(result.success).toBe(true);

    const newManifest = await getPostManifest();
    expect(newManifest.entries["post"]).toMatchObject({
      hash: "4YWHgbzidjsd3sQymUoR1gu0",
      publishDate: "2020-01-01T10:00:00.000Z",
      lastUpdateDate: null,
      fileName: "post-4YWHgb.html",
    });
  });

  it("updates a file where the V1 manifest indicates the post has changed - assumes no change this time.", async () => {
    await cleanUpDirectories();

    const legacyManifest: OldManifestEntries = {
      post: {
        fileName: "post-CHANGE.html",
        publishDate: "2020-01-01T10:00:00.000Z",
        lastUpdateDate: "2020-01-02T00:00:00.000Z",
        hash: undefined,
      },
    };

    await writeJsonFile(
      path.resolve("out/posts/post-manifest.json"),
      legacyManifest,
    );

    const newDate = "2020-02-01";
    advanceTo(newDate);

    const newPost: PostFileWithStringArrayContent = {
      slug: "post",
      meta: {
        title: "First Post",
        abstract: "First abstract",
        publish: true,
      },
      content: ["# First Post", "This is UPDATED content for the first post."],
    };

    await writePostFile(newPost);

    const result = await compilePosts();
    expect(result.success).toBe(true);

    const newManifest = await getPostManifest();
    expect(newManifest.entries["post"]).toMatchObject({
      hash: "4YWHgbzidjsd3sQymUoR1gu0",
      publishDate: "2020-01-01T10:00:00.000Z",
      lastUpdateDate: "2020-01-02T00:00:00.000Z",
      fileName: "post-4YWHgb.html",
    });
  });
});
