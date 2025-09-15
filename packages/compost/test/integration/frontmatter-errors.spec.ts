import { describe, expect, it } from "@jest/globals";
import { cleanUpDirectories, compilePosts, writePostFile } from "./helpers.js";

describe("front matter error handling", () => {
  it("fails compilation when front matter YAML is invalid", async () => {
    await cleanUpDirectories();

    const slug = "invalid-yaml-post";

    // Write a post with invalid YAML (unterminated string)
    await writePostFile({
      slug,
      meta: {
        title: "Test Post",
        abstract: "Test abstract",
        publish: true,
      },
      content: ["# Test Content"],
      metadataStyle: "frontmatter",
      // Override the front matter with invalid YAML
      frontMatterOverride: [
        "---",
        'title: "Test Post',
        'abstract: "Unterminated string',
        "publish: true",
        "---",
        "",
        "# Test Content",
      ].join("\n"),
    });

    const result = await compilePosts();

    expect(result).toEqual(
      expect.objectContaining({
        success: false,
        message: expect.stringContaining("can not read a block mapping entry"),
      }),
    );
  });

  it("fails compilation when front matter has invalid structure", async () => {
    await cleanUpDirectories();

    const slug = "invalid-structure-post";

    // Write a post with invalid front matter structure
    await writePostFile({
      slug,
      meta: {
        title: "Test Post",
        abstract: "Test abstract",
        publish: true,
      },
      content: ["# Test Content"],
      metadataStyle: "frontmatter",
      // Override with invalid structure (publish should be boolean)
      frontMatterOverride: [
        "---",
        'title: "Test Post"',
        'abstract: "Test abstract"',
        'publish: "not-a-boolean"',
        "---",
        "",
        "# Test Content",
      ].join("\n"),
    });

    const result = await compilePosts();

    expect(result).toEqual(
      expect.objectContaining({
        success: false,
        message: "Invalid front matter structure",
      }),
    );
  });

  it("fails compilation when front matter is missing required fields", async () => {
    await cleanUpDirectories();

    const slug = "missing-fields-post";

    // Write a post with missing required fields
    await writePostFile({
      slug,
      meta: {
        title: "Test Post",
        abstract: "Test abstract",
        publish: true,
      },
      content: ["# Test Content"],
      metadataStyle: "frontmatter",
      // Override with missing required fields
      frontMatterOverride: [
        "---",
        'title: "Test Post"',
        "---",
        "",
        "# Test Content",
      ].join("\n"),
    });

    const result = await compilePosts();

    expect(result).toEqual(
      expect.objectContaining({
        success: false,
        message: "Invalid front matter structure",
      }),
    );
  });

  it("skips files with unclosed front matter (detected by hasFrontMatter check)", async () => {
    await cleanUpDirectories();

    const slug = "unclosed-frontmatter-post";

    // Write a post with unclosed front matter - this will be skipped by hasFrontMatter check
    await writePostFile({
      slug,
      meta: {
        title: "Test Post",
        abstract: "Test abstract",
        publish: true,
      },
      content: ["# Test Content"],
      metadataStyle: "frontmatter",
      // Override with unclosed front matter
      frontMatterOverride: [
        "---",
        'title: "Test Post"',
        'abstract: "Test abstract"',
        "publish: true",
        "",
        "# Test Content",
      ].join("\n"),
    });

    const result = await compilePosts();

    // This should succeed because the file gets skipped (has no properly closed front matter)
    expect(result).toEqual(
      expect.objectContaining({
        success: true,
        value: expect.objectContaining({}),
      }),
    );
    // The manifest should be empty since no valid posts were processed
    if (result.success) {
      expect(Object.keys(result.value)).toHaveLength(0);
    }
  });
});
