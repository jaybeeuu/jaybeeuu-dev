import { describe, expect, it } from "@jest/globals";
import { writeTextFiles } from "../../src/files/index.js";
import { cleanUpDirectories, compilePosts, writePostFile } from "./helpers.js";

describe("front matter error handling", () => {
  it("fails compilation when front matter YAML is invalid", async () => {
    await cleanUpDirectories();

    const slug = "invalid-yaml-post";

    // Write a post with invalid YAML (unterminated string)
    const invalidYamlContent = [
      "---",
      'title: "Test Post',
      'abstract: "Unterminated string',
      "publish: true",
      "---",
      "",
      "# Test Content",
    ].join("\n");

    await writeTextFiles("src", [
      {
        path: `${slug}.post.md`,
        content: invalidYamlContent,
      },
    ]);

    const result = await compilePosts();

    expect(result).toMatchObject({
      success: false,
      reason: "content type processing failed",
    });
  });

  it("fails compilation when front matter has invalid structure", async () => {
    await cleanUpDirectories();

    const slug = "invalid-structure-post";

    // Write a post with invalid front matter structure
    const invalidStructureContent = [
      "---",
      'title: "Test Post"',
      'abstract: "Test abstract"',
      'publish: "not-a-boolean"',
      "---",
      "",
      "# Test Content",
    ].join("\n");

    await writeTextFiles("src", [
      {
        path: `${slug}.post.md`,
        content: invalidStructureContent,
      },
    ]);

    const result = await compilePosts();

    expect(result).toMatchObject({
      success: false,
      reason: "content type processing failed",
    });
  });

  it("fails compilation when front matter is missing required fields", async () => {
    await cleanUpDirectories();

    const slug = "missing-fields-post";

    // Write a post with missing required fields
    const missingFieldsContent = [
      "---",
      'title: "Test Post"',
      "---",
      "",
      "# Test Content",
    ].join("\n");

    await writeTextFiles("src", [
      {
        path: `${slug}.post.md`,
        content: missingFieldsContent,
      },
    ]);

    const result = await compilePosts();

    expect(result).toMatchObject({
      success: false,
      reason: "content type processing failed",
    });
  });

  it("skips files with unclosed front matter (detected by hasFrontMatter check)", async () => {
    await cleanUpDirectories();

    const slug = "unclosed-frontmatter-post";

    // Write a post with unclosed front matter - this will be skipped by hasFrontMatter check
    await writePostFile({
      slug,
      meta: null,
      content: [
        "---",
        'title: "Test Post"',
        'abstract: "Test abstract"',
        "publish: true",
        "",
        "# Test Content",
      ],
      metadataStyle: "frontmatter",
    });

    const result = await compilePosts();

    // This should succeed because the file gets skipped (has no properly closed front matter)
    expect(result).toMatchObject({
      success: true,
    });
    // The manifest should be empty since no valid posts were processed
    if (result.success) {
      expect(Object.keys(result.value.entries)).toHaveLength(0);
    }
  });
});
