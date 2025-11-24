import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import { resolve } from "node:path";
import fs from "node:fs/promises";
import {
  compost,
  createContentType,
  type OrchestratorConfig,
  type ContentTypeDefinition,
} from "../../src/index.js";

describe("LastUpdateDate Preservation (Programmatic API)", () => {
  const testDir = resolve(__dirname, "../fixtures/lastupdate-test");
  const sourceDir = resolve(testDir, "src");
  const outputDir = resolve(testDir, "out");
  const manifestPath = resolve(outputDir, "post-manifest.json");
  const oldManifestPath = resolve(testDir, "old-manifest.json");

  interface PostInputMeta {
    title: string;
    abstract: string;
    publish: boolean;
    publishDate: string;
    type: string;
    [key: string]: unknown;
  }

  interface PostOutputMeta {
    title: string;
    abstract: string;
    readingTime: {
      text: string;
      minutes: number;
      time: number;
      words: number;
    };
    [key: string]: unknown;
  }

  const createPostContentType = () =>
    createContentType({
      contentType: "post",
      filePatterns: {
        frontmatter: [".post.md"],
        jsonMetadata: [".md"],
        jsonSuffix: ".post.json",
      },
      generateSlug: (filePath: string, sourceDirPath: string) => {
        return filePath
          .replace(sourceDirPath + "/", "")
          .replace(/\.(post\.)?md$/, "");
      },
      generateFileName: (slug: string) => `${slug}.html`,
      validateInputMeta: (data: unknown): data is PostInputMeta => {
        return (
          data !== null &&
          typeof data === "object" &&
          "title" in data &&
          "abstract" in data &&
          "publish" in data &&
          typeof (data as any).title === "string" &&
          typeof (data as any).abstract === "string" &&
          typeof (data as any).publish === "boolean"
        );
      },
      mapToOutputMeta: (input: PostInputMeta) => ({
        title: input.title,
        abstract: input.abstract,
        readingTime: { text: "1 min read", minutes: 1, time: 60000, words: 50 },
      }),
      sourceDir,
      outputDir,
      hrefRoot: "/test",
      includeUnpublished: false,
      codeLineNumbers: false,
      removeH1: false,
      requireOldManifest: false,
      oldManifestLocators: [oldManifestPath],
    });

  async function runCompost(): Promise<void> {
    const orchestratorConfig: OrchestratorConfig = { clean: false };
    const contentTypes = { post: createPostContentType() };

    const result = await compost(orchestratorConfig, contentTypes);
    if (!result.success) {
      throw new Error(`Compost compilation failed: ${result.message}`);
    }
  }

  beforeEach(async () => {
    // Setup test directory structure
    await fs.mkdir(sourceDir, { recursive: true });
    await fs.mkdir(outputDir, { recursive: true });

    // Create a test post
    await fs.writeFile(
      resolve(sourceDir, "test-post.post.md"),
      `---
title: "Test Post"
abstract: "A test post for lastUpdateDate functionality"
publish: true
publishDate: "2024-01-01T00:00:00.000Z"
type: "post"
---

# Test Post

This is original content.`,
    );

    // Create an old v1 manifest (flat structure) with existing lastUpdateDate
    const oldManifest = {
      "test-post": {
        title: "Test Post",
        abstract: "A test post for lastUpdateDate functionality",
        publish: true,
        fileName: "test-post-abc123.html",
        href: "/test/test-post-abc123.html",
        publishDate: "2024-01-01T00:00:00.000Z",
        lastUpdateDate: "2024-06-15T10:30:00.000Z", // This should be preserved
        readingTime: {
          text: "1 min read",
          minutes: 1,
          time: 60000,
          words: 50,
        },
        slug: "test-post",
        // Note: no 'hash' field - this makes it a v1 manifest
      },
    };

    await fs.writeFile(oldManifestPath, JSON.stringify(oldManifest, null, 2));
  });

  afterEach(async () => {
    // Clean up test files
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (err) {
      // Ignore cleanup errors
    }
  });

  it("should preserve lastUpdateDate when content hasn't changed", async () => {
    // Run compost CLI - content hasn't changed, should preserve lastUpdateDate
    await runCompost();

    // Read the generated manifest
    const manifestContent = await fs.readFile(manifestPath, "utf-8");
    const manifest = JSON.parse(manifestContent);

    // Verify lastUpdateDate is preserved
    const testPost = manifest.entries["test-post"];
    expect(testPost.lastUpdateDate).toBe("2024-06-15T10:30:00.000Z");
  }, 15000);

  it("should preserve lastUpdateDate for v1 entries even when content changes (v1 compatibility)", async () => {
    // First build with original content
    await runCompost();

    // Modify the content
    await fs.writeFile(
      resolve(sourceDir, "test-post.post.md"),
      `---
title: "Test Post"
abstract: "A test post for lastUpdateDate functionality"
publish: true
publishDate: "2024-01-01T00:00:00.000Z"
type: "post"
---

# Test Post

This is modified content that should trigger lastUpdateDate change.`,
    );

    // Second build with modified content
    await runCompost();

    // Read the generated manifest
    const manifestContent = await fs.readFile(manifestPath, "utf-8");
    const manifest = JSON.parse(manifestContent);

    // For v1 entries, lastUpdateDate should be preserved even when content changes
    // because we can't reliably detect content changes without proper hashes
    const testPost = manifest.entries["test-post"];
    expect(testPost.lastUpdateDate).toBe("2024-06-15T10:30:00.000Z");
  }, 15000);

  it("should handle new posts with null lastUpdateDate", async () => {
    // Remove the old manifest entry for this post, making it "new"
    const oldManifest = {}; // Empty v1 manifest

    await fs.writeFile(oldManifestPath, JSON.stringify(oldManifest, null, 2));

    // Build the content
    await runCompost();

    // Read the generated manifest
    const manifestContent = await fs.readFile(manifestPath, "utf-8");
    const manifest = JSON.parse(manifestContent);

    // Verify new post has null lastUpdateDate
    const testPost = manifest.entries["test-post"];
    expect(testPost.lastUpdateDate).toBeNull();
  }, 15000);

  it("should update lastUpdateDate for v2 entries when content changes", async () => {
    // First, create a v2 manifest with proper hash to test v2 behavior
    await runCompost(); // Build once to get the initial v2 manifest

    // Read the generated manifest to get the proper hash
    let manifestContent = await fs.readFile(manifestPath, "utf-8");
    let manifest = JSON.parse(manifestContent);

    // Create a v2 manifest with the proper hash and set an old lastUpdateDate
    const v2Manifest = {
      version: 2,
      metadata: manifest.metadata,
      entries: {
        "test-post": {
          ...manifest.entries["test-post"],
          lastUpdateDate: "2024-06-15T10:30:00.000Z", // Set old date
        },
      },
    };

    await fs.writeFile(oldManifestPath, JSON.stringify(v2Manifest, null, 2));

    // Modify the content
    await fs.writeFile(
      resolve(sourceDir, "test-post.post.md"),
      `---
title: "Test Post"
abstract: "A test post for lastUpdateDate functionality"
publish: true
publishDate: "2024-01-01T00:00:00.000Z"
type: "post"
---

# Test Post

This is SIGNIFICANTLY MODIFIED content that should definitely trigger a hash change for v2 testing.

This content is much longer and different from the original to ensure the hash changes.`,
    );

    // Second build with modified content and v2 manifest
    await runCompost();

    // Read the new manifest
    manifestContent = await fs.readFile(manifestPath, "utf-8");
    manifest = JSON.parse(manifestContent);

    // For v2 entries with proper hashes, lastUpdateDate should be updated when content changes
    const testPost = manifest.entries["test-post"];
    expect(testPost.lastUpdateDate).toBeDefined();
    expect(testPost.lastUpdateDate).not.toBe("2024-06-15T10:30:00.000Z");

    // Verify the new lastUpdateDate is recent
    const lastUpdateTime = new Date(testPost.lastUpdateDate).getTime();
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    expect(lastUpdateTime).toBeGreaterThan(oneMinuteAgo);
    expect(lastUpdateTime).toBeLessThanOrEqual(now);
  }, 20000);
});
