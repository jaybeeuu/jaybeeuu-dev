import getReadingTime from "reading-time";
import {
  isPostInputMetadata,
  type PostInputMetadata,
  type PostManifestEntryCustomProperties,
} from "./types.js";
import { createCompostConfig } from "@jaybeeuu/compost/config";

export const config = createCompostConfig("post", {
  contentType: "post",
  filePatterns: {
    frontmatter: [".post.md"],
    jsonMetadata: [".md"],
    jsonSuffix: ".post.json",
  },
  validateInputMeta: (data: unknown): data is PostInputMetadata => {
    return isPostInputMetadata(data);
  },
  mapToManifestEntry: (
    input: PostInputMetadata,
    content: string,
  ): PostManifestEntryCustomProperties => {
    const readingTime = getReadingTime(content);
    return {
      abstract: input.abstract,
      readingTime,
    };
  },
  sourceDir: "src",
  outputDir: "lib",
  hrefRoot: "/blog",
  includeUnpublished: false,
  codeLineNumbers: true,
  removeH1: true,
  requireOldManifest: false,
  oldManifestLocators: [
    "https://jaybeeuu.dev/blog/post-manifest.json", // v2 format
    "https://jaybeeuu.dev/blog/manifest.json", // v1 format (fallback)
  ],
});

export default config;
