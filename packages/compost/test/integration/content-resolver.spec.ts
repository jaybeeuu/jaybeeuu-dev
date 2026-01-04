import { describe, expect, it } from "@jest/globals";
import { cleanUpDirectories, compilePosts } from "./helpers.js";
import { writeTextFiles } from "../../src/files/index.js";

describe("post resolver integration", () => {
  describe("frontmatter post failures", () => {
    it("skips files that cannot be read", async () => {
      await cleanUpDirectories();

      // Create a directory instead of a file to simulate read failure
      await writeTextFiles("src", [
        {
          path: "invalid-file.post.md/nested-file.txt",
          content:
            "This creates a directory structure that breaks file reading",
        },
      ]);

      const result = await compilePosts();

      // Should succeed but skip unreadable files
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Object.keys(result.value.entries)).toHaveLength(0);
      }
    });

    it("skips files with missing frontmatter", async () => {
      await cleanUpDirectories();

      const slug = "no-frontmatter-post";

      await writeTextFiles("src", [
        {
          path: `${slug}.post.md`,
          content: "# Test Post\n\nThis markdown has no frontmatter at all.",
        },
      ]);

      const result = await compilePosts();

      // Should succeed but skip the file
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Object.keys(result.value.entries)).toHaveLength(0);
      }
    });

    it("fails compilation with invalid frontmatter YAML", async () => {
      await cleanUpDirectories();

      const slug = "invalid-frontmatter-post";

      await writeTextFiles("src", [
        {
          path: `${slug}.post.md`,
          content: `---
title: "Test Post"
abstract: "Test abstract"
publish: true
invalid: yaml: structure: here
---

# Test Post

This is test content.`,
        },
      ]);

      const result = await compilePosts();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe("file processing failed");
      }
    });

    it("fails compilation with valid frontmatter YAML, missing fields", async () => {
      await cleanUpDirectories();

      const slug = "invalid-frontmatter-post";

      await writeTextFiles("src", [
        {
          path: `${slug}.post.md`,
          content: `---
title: "Test Post"
---

# Test Post

This is test content.`,
        },
      ]);

      const result = await compilePosts();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe("file processing failed");
      }
    });

    it("returns a failure when a content file cannot be read.", async () => {
      await cleanUpDirectories();

      await writeTextFiles("src", [
        {
          path: "invalid-file.post.md",
          content: "<CORRUPTED FILE>",
        },
      ]);

      const result = await compilePosts();

      expect(result).toMatchObject({
        success: false,
        message: expect.stringContaining("Failed to read file"),
      });
    });
  });

  describe("json post failures", () => {
    it("skips posts when markdown source file cannot be read", async () => {
      await cleanUpDirectories();

      // Create a directory structure that breaks markdown file reading
      await writeTextFiles("src", [
        {
          path: "invalid-markdown.md/nested-file.txt",
          content: "This creates a directory structure",
        },
        {
          path: "invalid-markdown.post.json",
          content: JSON.stringify({
            title: "Test Post",
            abstract: "Test abstract",
            publish: true,
          }),
        },
      ]);

      const result = await compilePosts();

      // Should succeed but skip unreadable files
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Object.keys(result.value.entries)).toHaveLength(0);
      }
    });

    it("skips posts when JSON metadata file is missing", async () => {
      await cleanUpDirectories();

      const slug = "missing-json-post";

      await writeTextFiles("src", [
        {
          path: `${slug}.md`,
          content:
            "# Test Post\n\nThis markdown has no corresponding .post.json file.",
        },
      ]);

      const result = await compilePosts();

      // Should succeed but skip the file
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Object.keys(result.value.entries)).toHaveLength(0);
      }
    });

    it("fails compilation when JSON metadata has invalid structure", async () => {
      await cleanUpDirectories();

      const slug = "invalid-metadata-post";

      await writeTextFiles("src", [
        {
          path: `${slug}.md`,
          content: "# Test Post\n\nThis is test content.",
        },
        {
          path: `${slug}.post.json`,
          content: JSON.stringify({
            title: "Test Post",
            // Missing required fields: abstract and publish
          }),
        },
      ]);

      const result = await compilePosts();

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.reason).toBe("file processing failed");
      }
    });
  });

  describe("unsupported file extensions", () => {
    it("skips files with unsupported extensions during compilation.", async () => {
      await cleanUpDirectories();

      await writeTextFiles("src", [
        {
          path: "unsupported-file.txt",
          content: "This file has an unsupported extension",
        },
        {
          path: "another-unsupported.doc",
          content: "Another unsupported file",
        },
      ]);

      const result = await compilePosts();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(Object.keys(result.value.entries)).toHaveLength(0);
      }
    });

    it("returns a failure when a content file cannot be read.", async () => {
      await cleanUpDirectories();

      await writeTextFiles("src", [
        {
          path: "invalid-file.md",
          content: "<CORRUPTED FILE>",
        },
        {
          path: "invalid-file.post.json",
          content: JSON.stringify({
            title: "Test Post",
            abstract: "Test abstract",
            publish: true,
          }),
        },
      ]);

      const result = await compilePosts();

      expect(result).toMatchObject({
        success: false,
        message: expect.stringContaining("Failed to read file"),
      });
    });

    it("returns a failure when a json metadata file cannot be read.", async () => {
      await cleanUpDirectories();

      await writeTextFiles("src", [
        {
          path: "invalid-file.md",
          content: "# This is some markdown content.",
        },
        {
          path: "invalid-file.post.json",
          content: "<CORRUPTED FILE>",
        },
      ]);

      const result = await compilePosts();

      expect(result).toMatchObject({
        success: false,
        message: expect.stringContaining("Failed to read file"),
      });
    });
  });

  describe("source file read failures", () => {
    it("skips frontmatter posts when source file cannot be read", async () => {
      await cleanUpDirectories();

      // Create a directory instead of a file to simulate read failure
      await writeTextFiles("src", [
        {
          path: "unreadable-frontmatter.post.md/nested-file.txt",
          content:
            "This creates a directory structure that breaks file reading",
        },
      ]);

      const result = await compilePosts();

      // Should succeed but skip unreadable files
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Object.keys(result.value.entries)).toHaveLength(0);
      }
    });

    it("skips JSON posts when source file cannot be read", async () => {
      await cleanUpDirectories();

      // Create a directory structure that breaks markdown file reading
      await writeTextFiles("src", [
        {
          path: "unreadable-json.md/nested-file.txt",
          content: "This creates a directory structure",
        },
        {
          path: "unreadable-json.post.json",
          content: JSON.stringify({
            title: "Test Post",
            abstract: "Test abstract",
            publish: true,
          }),
        },
      ]);

      const result = await compilePosts();

      // Should succeed but skip unreadable files
      expect(result.success).toBe(true);
      if (result.success) {
        expect(Object.keys(result.value.entries)).toHaveLength(0);
      }
    });
  });

  describe("successful post resolution", () => {
    it("successfully resolves frontmatter posts", async () => {
      await cleanUpDirectories();

      const slug = "successful-frontmatter-post";

      await writeTextFiles("src", [
        {
          path: `${slug}.post.md`,
          content: `---
title: "Test Post"
abstract: "Test abstract"
publish: true
stars: 5
---

# Test Post

This is test content.`,
        },
      ]);

      const result = await compilePosts();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(Object.keys(result.value.entries)).toHaveLength(1);
        expect(result.value.entries[slug]).toBeDefined();
        expect(result.value.entries[slug]?.abstract).toBe("Test abstract");
      }
    });

    it("successfully resolves JSON posts", async () => {
      await cleanUpDirectories();

      const slug = "successful-json-post";

      await writeTextFiles("src", [
        {
          path: `${slug}.md`,
          content: "# Test Post\n\nThis is test content.",
        },
        {
          path: `${slug}.post.json`,
          content: JSON.stringify({
            title: "Test Post",
            abstract: "Test abstract",
            publish: true,
            stars: 5,
          }),
        },
      ]);

      const result = await compilePosts();

      expect(result.success).toBe(true);
      if (result.success) {
        expect(Object.keys(result.value.entries)).toHaveLength(1);
        expect(result.value.entries[slug]).toBeDefined();
        expect(result.value.entries[slug]?.abstract).toBe("Test abstract");
      }
    });
  });
});
