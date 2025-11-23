import { describe, it, expect } from "@jest/globals";
import { validateCompostConfig } from "../../src/content/content-types.js";
import type { CompostConfig } from "../../src/content/content-types.js";

describe("config validation", () => {
  it("should validate a proper CompostConfig", () => {
    const validConfig: CompostConfig = {
      contentTypes: {
        posts: {
          contentType: "posts",
          filePatterns: {
            frontmatter: ["**/*.md", "**/*.mdx"],
            jsonMetadata: ["**/*.json"],
            jsonSuffix: ".meta.json",
          },
          generateSlug: (filePath: string) => filePath,
          generateFileName: (slug: string) => `${slug}.html`,
          validateInputMeta: (
            data: unknown,
          ): data is { title: string; publish: boolean } =>
            typeof data === "object" &&
            data !== null &&
            "title" in data &&
            "publish" in data,
          hrefRoot: "/",
          includeUnpublished: false,
          codeLineNumbers: false,
          removeH1: false,
        },
      },
    };

    expect(validateCompostConfig(validConfig)).toBe(true);
  });

  it("should reject config with invalid structure", () => {
    const invalidConfig = {
      contentTypes: "not an object",
    };

    expect(validateCompostConfig(invalidConfig)).toBe(false);
  });

  it("should reject config with missing contentTypes", () => {
    const invalidConfig = {
      notContentTypes: {},
    };

    expect(validateCompostConfig(invalidConfig)).toBe(false);
  });

  it("should reject config with invalid contentType definition", () => {
    const invalidConfig = {
      contentTypes: {
        posts: {
          // Missing required fields
          contentType: "posts",
        },
      },
    };

    expect(validateCompostConfig(invalidConfig)).toBe(false);
  });

  it("should reject config where contentType key doesn't match contentType field", () => {
    const invalidConfig = {
      contentTypes: {
        posts: {
          contentType: "blogs", // Should be "posts"
          filePatterns: {
            frontmatter: ["**/*.md"],
            jsonMetadata: ["**/*.json"],
            jsonSuffix: ".meta.json",
          },
          generateSlug: () => "slug",
          generateFileName: () => "file.html",
          validateInputMeta: () => true,
          hrefRoot: "/",
          includeUnpublished: false,
          codeLineNumbers: false,
          removeH1: false,
        },
      },
    };

    expect(validateCompostConfig(invalidConfig)).toBe(false);
  });

  it("should reject config with invalid filePatterns arrays", () => {
    const invalidConfig = {
      contentTypes: {
        posts: {
          contentType: "posts",
          filePatterns: {
            frontmatter: "not an array", // Should be string array
            jsonMetadata: ["**/*.json"],
            jsonSuffix: ".meta.json",
          },
          generateSlug: () => "slug",
          generateFileName: () => "file.html",
          validateInputMeta: () => true,
          hrefRoot: "/",
          includeUnpublished: false,
          codeLineNumbers: false,
          removeH1: false,
        },
      },
    };

    expect(validateCompostConfig(invalidConfig)).toBe(false);
  });
});
