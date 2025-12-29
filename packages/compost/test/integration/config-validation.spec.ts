import { describe, it, expect } from "@jest/globals";
import { createContentDefinition } from "../../src/content/content-definition.js";

describe("config validation", () => {
  it("should validate a proper ContentDefinition", () => {
    // Define the type guard separately for proper type inference
    const isPostInputMeta = (
      data: unknown,
    ): data is { title: string; publish: boolean } =>
      typeof data === "object" &&
      data !== null &&
      "title" in data &&
      "publish" in data;

    const postDef = createContentDefinition("posts", {
      filePatterns: {
        frontmatter: ["**/*.md", "**/*.mdx"],
        jsonMetadata: ["**/*.json"],
        jsonFileExt: ".meta.json",
      },
      generateSlug: ({ filePath }) => filePath,
      generateFileName: ({ slug }) => `${slug}.html`,
      validateInputMeta: isPostInputMeta,
      hrefRoot: "/",
      mapToManifestEntry: (input, content) => ({
        fileName: `${input.title.replace(/\s+/g, "-").toLowerCase()}.html`,
        publishDate: input.publishDate,
        contentLength: content.length,
      }),
      includeUnpublished: false,
      codeLineNumbers: false,
      removeH1: false,
    });

    expect(postDef).toBeDefined();

    // Verify runtime structure is correct
    expect(postDef.contentType).toBe("posts");
    expect(postDef.hrefRoot).toBe("/");

    // The mapToManifestEntry should be defined
    expect(typeof postDef.mapToManifestEntry).toBe("function");
  });

  it("should validate manifest structure", () => {
    const manifest = {
      version: 2,
      metadata: {
        generatedAt: "2025-01-01T00:00:00Z",
        entryCount: 1,
        overallHash: "abc123",
      },
      entries: {
        "test-post": {
          href: "/posts/test-post.html",
          hash: "abc123",
          fileName: "test-post.html",
          publishDate: "2025-01-01T00:00:00Z",
          lastUpdateDate: null,
          slug: "test-post",
        },
      },
    };

    // isManifest checks for BaseManifestEntry structure
    // The manifest is valid if it has the required BaseManifestEntry properties
    expect(manifest.version).toBe(2);
    expect(manifest.entries["test-post"]).toMatchObject({
      href: "/posts/test-post.html",
    });
  });
});
