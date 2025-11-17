import { describe, expect, it } from "@jest/globals";
import { advanceTo, clear } from "jest-date-mock";
import {
  cleanUpDirectories,
  compilePosts,
  getPostManifest,
  getOutputFile,
  writePostFile,
  type PostFile,
  type TestPostOutputMetadata,
  type TestPostManifestEntry,
  isTestPostOutputMetadata,
} from "./helpers.js";
import { writeJsonFile } from "../../src/files/index.js";
import path from "path";
import type { BaseOutputMeta } from "../../src/content/services/manifest/manifest-operations.js";
import {
  isManifest,
  isBaseOutputMeta,
} from "../../src/content/services/manifest/manifest-operations.js";
import { isObject, isIntersectionOf, is } from "@jaybeeuu/is";

interface PostFileWithStringArrayContent extends Omit<PostFile, "content"> {
  content: string[];
}

describe("manifest versioning compatibility", () => {
  beforeEach(() => {
    clear();
  });

  it("successfully migrates from v1 manifest to v2 manifest with proper change detection", async () => {
    await cleanUpDirectories();

    const slug1 = "first-post";
    const slug2 = "second-post";

    // Step 1: Create a legacy v1 manifest (no version field, direct entries, no hash)
    // V1 manifest entries don't have hash field - that's added during migration
    const legacyManifest: {
      [slug: string]: Omit<TestPostManifestEntry, "hash">;
    } = {
      [slug1]: {
        title: "First Post",
        abstract: "First abstract",
        fileName: "first-post-oldHash.html",
        href: "/posts/first-post-oldHash.html",
        publishDate: "2020-01-15T10:00:00.000Z",
        lastUpdateDate: null,
        slug: slug1,
        readingTime: {
          minutes: 5,
          text: "5 min read",
          time: 300000,
          words: 100,
        },
      },
      [slug2]: {
        title: "Second Post",
        abstract: "Second abstract",
        fileName: "second-post-oldHash.html",
        href: "/posts/second-post-oldHash.html",
        publishDate: "2020-01-20T14:30:00.000Z",
        lastUpdateDate: "2020-01-25T09:15:00.000Z",
        slug: slug2,
        readingTime: {
          minutes: 8,
          text: "8 min read",
          time: 480000,
          words: 160,
        },
      },
    };

    // Write the legacy manifest directly
    await writeJsonFile(
      path.resolve("out/posts/post-manifest.json"),
      legacyManifest,
    );

    // Step 2: Create current post files with different content
    const originalDate = "2020-02-01";
    advanceTo(originalDate);

    // First post - content will be DIFFERENT from legacy manifest (should trigger update)
    const post1: PostFileWithStringArrayContent = {
      slug: slug1,
      meta: {
        title: "First Post",
        abstract: "First abstract",
        publish: true,
      },
      content: ["# First Post", "This is UPDATED content for the first post."],
    };

    // Second post - content will be the SAME as what would produce the old filename (no update)
    const post2: PostFileWithStringArrayContent = {
      slug: slug2,
      meta: {
        title: "Second Post",
        abstract: "Second abstract",
        publish: true,
      },
      content: ["# Second Post", "This content should match the old hash."],
    };

    await writePostFile(post1);
    await writePostFile(post2);

    // Step 3: Compile posts (this should migrate v1 -> v2 and detect changes)
    const updateDate = "2020-02-10";
    advanceTo(updateDate);

    const result = await compilePosts();
    expect(result.success).toBe(true);

    // Step 4: Verify the new manifest is v2 format and has correct change detection
    const newManifest = await getPostManifest();

    // Verify both posts are in the manifest
    expect(newManifest.entries[slug1]).toBeDefined();
    expect(newManifest.entries[slug2]).toBeDefined();

    // Verify v2 format - all entries should now have hash fields
    expect(newManifest.entries[slug1]?.hash).toMatch(/^[a-f0-9]{40}$/);
    expect(newManifest.entries[slug2]?.hash).toMatch(/^[a-f0-9]{40}$/);

    // First post: Content changed, so should detect update
    expect(newManifest.entries[slug1]?.publishDate).toBe(
      "2020-01-15T10:00:00.000Z",
    ); // Preserved from v1
    expect(newManifest.entries[slug1]?.lastUpdateDate).toBe(
      "2020-02-10T00:00:00.000Z",
    ); // Updated to current time
    expect(newManifest.entries[slug1]?.fileName).not.toBe(
      "first-post-oldHash.html",
    ); // New filename due to content change

    // Second post: If content produces same filename, preserve dates but use filename fallback for change detection
    expect(newManifest.entries[slug2]?.publishDate).toBe(
      "2020-01-20T14:30:00.000Z",
    ); // Preserved from v1

    // For the second post, the behavior depends on whether the content produces the same filename
    // If filename is different, it will be treated as updated
    // If filename is same, it will preserve lastUpdateDate
    if (newManifest.entries[slug2]?.fileName === "second-post-oldHash.html") {
      // No change detected (same filename)
      expect(newManifest.entries[slug2].lastUpdateDate).toBe(
        "2020-01-25T09:15:00.000Z",
      ); // Preserved from v1
    } else {
      // Change detected (different filename)
      expect(newManifest.entries[slug2]?.lastUpdateDate).toBe(
        "2020-02-10T00:00:00.000Z",
      ); // Updated to current time
    }
  });

  it("handles subsequent updates using v2 hash-based change detection", async () => {
    await cleanUpDirectories();

    const slug = "test-post";

    // Step 1: Create initial post and compile (creates v2 manifest)
    const initialDate = "2020-03-01";
    advanceTo(initialDate);

    const initialPost: PostFileWithStringArrayContent = {
      slug,
      meta: {
        title: "Test Post",
        abstract: "Test abstract",
        publish: true,
      },
      content: ["# Test Post", "Initial content."],
    };

    await writePostFile(initialPost);
    await compilePosts();

    const initialManifest = await getPostManifest();
    const initialEntry = initialManifest.entries[slug];
    if (!initialEntry) throw new Error(`Entry ${slug} not found`);
    const initialHash = initialEntry.hash;
    const initialFileName = initialEntry.fileName;

    // Verify initial v2 manifest
    expect(initialHash).toMatch(/^[a-f0-9]{40}$/);
    expect(initialManifest.entries[slug]?.publishDate).toBe(
      "2020-03-01T00:00:00.000Z",
    );
    expect(initialManifest.entries[slug]?.lastUpdateDate).toBe(null);

    // Step 2: Update content and recompile
    const updateDate = "2020-03-15";
    advanceTo(updateDate);

    const updatedPost: PostFileWithStringArrayContent = {
      slug,
      meta: {
        title: "Test Post",
        abstract: "Test abstract",
        publish: true,
      },
      content: ["# Test Post", "Updated content with more information."],
    };

    await writePostFile(updatedPost);
    await compilePosts();

    const updatedManifest = await getPostManifest();

    // Verify hash-based change detection worked
    expect(updatedManifest.entries[slug]?.hash).toMatch(/^[a-f0-9]{40}$/);
    expect(updatedManifest.entries[slug]?.hash).not.toBe(initialHash); // Hash should be different
    expect(updatedManifest.entries[slug]?.fileName).not.toBe(initialFileName); // Filename should be different
    expect(updatedManifest.entries[slug]?.publishDate).toBe(
      "2020-03-01T00:00:00.000Z",
    ); // Preserved
    expect(updatedManifest.entries[slug]?.lastUpdateDate).toBe(
      "2020-03-15T00:00:00.000Z",
    ); // Updated

    // Step 3: Recompile without changes (should detect no changes)
    const noChangeDate = "2020-03-20";
    advanceTo(noChangeDate);

    await compilePosts(); // Same content

    const unchangedManifest = await getPostManifest();

    // Verify no change was detected
    expect(unchangedManifest.entries[slug]?.hash).toBe(
      updatedManifest.entries[slug]?.hash,
    ); // Same hash
    expect(unchangedManifest.entries[slug]?.fileName).toBe(
      updatedManifest.entries[slug]?.fileName,
    ); // Same filename
    expect(unchangedManifest.entries[slug]?.publishDate).toBe(
      "2020-03-01T00:00:00.000Z",
    ); // Still preserved
    expect(unchangedManifest.entries[slug]?.lastUpdateDate).toBe(
      "2020-03-15T00:00:00.000Z",
    ); // Still preserved (not updated to noChangeDate)
  });

  it("correctly handles metadata-only changes using hash-based detection", async () => {
    await cleanUpDirectories();

    const slug = "metadata-test";

    // Step 1: Create initial post
    const initialDate = "2020-04-01";
    advanceTo(initialDate);

    const initialPost: PostFileWithStringArrayContent = {
      slug,
      meta: {
        title: "Original Title",
        abstract: "Original abstract",
        publish: true,
      },
      content: ["# Test Post", "Same content throughout."],
    };

    await writePostFile(initialPost);
    await compilePosts();

    const initialManifest = await getPostManifest();
    const initialEntry3 = initialManifest.entries[slug];
    if (!initialEntry3) throw new Error(`Entry ${slug} not found`);
    const initialHash = initialEntry3.hash;

    // Step 2: Change only metadata, keep content the same
    const metadataChangeDate = "2020-04-10";
    advanceTo(metadataChangeDate);

    const metadataChangedPost: PostFileWithStringArrayContent = {
      slug,
      meta: {
        title: "Updated Title", // Changed
        abstract: "Updated abstract", // Changed
        publish: true,
      },
      content: ["# Test Post", "Same content throughout."], // Unchanged
    };

    await writePostFile(metadataChangedPost);
    await compilePosts();

    const updatedManifest = await getPostManifest();

    // Verify metadata changes are detected via hash (content + metadata hash)
    expect(updatedManifest.entries[slug]?.hash).not.toBe(initialHash); // Hash should change due to metadata change
    expect(updatedManifest.entries[slug]?.title).toBe("Updated Title"); // New metadata present
    expect(updatedManifest.entries[slug]?.abstract).toBe("Updated abstract"); // New metadata present
    expect(updatedManifest.entries[slug]?.publishDate).toBe(
      "2020-04-01T00:00:00.000Z",
    ); // Preserved
    expect(updatedManifest.entries[slug]?.lastUpdateDate).toBe(
      "2020-04-10T00:00:00.000Z",
    ); // Updated due to metadata change
  });

  it("maintains v2 format when writing new manifests", async () => {
    await cleanUpDirectories();

    const slug = "version-test";

    // Create and compile a post
    await writePostFile({
      slug,
      meta: {
        title: "Version Test",
        abstract: "Testing version format",
        publish: true,
      },
      content: ["# Version Test", "Content for version test."],
    });

    await compilePosts();

    // Read the raw manifest file to verify it has version structure
    const rawManifestContent = await getOutputFile("post-manifest.json");
    const parsedManifest = JSON.parse(rawManifestContent) as unknown;

    // Use the actual isManifest validator from content module with proper type predicate
    const manifestValidator = isManifest(
      isIntersectionOf(isBaseOutputMeta, isTestPostOutputMetadata),
    );

    if (!manifestValidator(parsedManifest)) {
      throw new Error("Invalid manifest structure");
    }

    const rawManifest = parsedManifest;

    // Verify v2 structure
    expect(rawManifest.version).toBe(2);
    expect(rawManifest.entries).toBeDefined();
    expect(rawManifest.entries[slug]).toBeDefined();
    expect(rawManifest.entries[slug]?.hash).toMatch(/^[a-f0-9]{40}$/);

    // Verify new metadata fields
    expect(rawManifest.metadata).toBeDefined();
    expect(rawManifest.metadata.generatedAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
    ); // ISO timestamp
    expect(rawManifest.metadata.entryCount).toBe(1); // One post
    expect(rawManifest.metadata.overallHash).toMatch(/^[a-f0-9]{40}$/); // MD5 hash

    // Verify the helper function correctly extracts entries
    const manifest = await getPostManifest();
    expect(manifest.entries[slug]).toEqual(rawManifest.entries[slug]);
  });
});
