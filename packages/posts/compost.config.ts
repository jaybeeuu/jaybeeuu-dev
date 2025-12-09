import path from "node:path";
import getReadingTime from "reading-time";
import type { BaseInputMetadata, ContentDefinition } from "@jaybeeuu/compost";
import { createCompostConfig } from "@jaybeeuu/compost";
import type { CheckedBy } from "@jaybeeuu/is";
import { is, isObject } from "@jaybeeuu/is";

// Internal types for compost configuration - not exported in public API
const isPostInputMetadata = isObject({
  title: is("string"),
  abstract: is("string"),
  publish: is("boolean"),
} as const);
type PostInputMetadata = CheckedBy<typeof isPostInputMetadata> &
  BaseInputMetadata;

type PostManifestEntrydata = {
  title: string;
  abstract: string;
  readingTime: ReturnType<typeof getReadingTime>;
};

/**
 * Generates a compiled post filename with content hash for cache busting
 */
const getCompiledPostFileName = (slug: string, html: string): string => {
  // Simple hash function for demo - in production you might want crypto.createHash
  let hash = 0;
  for (let i = 0; i < html.length; i++) {
    const char = html.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  const hashString = Math.abs(hash).toString(16);
  return `${slug}-${hashString}.html`;
};

const postContentType: ContentDefinition<
  "post",
  PostInputMetadata,
  PostManifestEntrydata
> = {
  contentType: "post",
  filePatterns: {
    frontmatter: [".post.md"],
    jsonMetadata: [".md"],
    jsonSuffix: ".post.json",
  },
  generateSlug: (filePath: string, sourceDir: string) => {
    const relativePath = path.relative(sourceDir, filePath);
    return path
      .basename(relativePath, path.extname(relativePath))
      .replace(/\.post$/, "");
  },
  generateFileName: (slug: string, html: string) => {
    return getCompiledPostFileName(slug, html);
  },
  validateInputMeta: (data: unknown): data is PostInputMetadata => {
    return isPostInputMetadata(data);
  },
  mapToManifestEntry: (
    input: PostInputMetadata,
    content: string,
  ): PostManifestEntrydata => {
    const readingTime = getReadingTime(content);
    return {
      title: input.title,
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
};

const config = createCompostConfig({
  post: postContentType,
});

export default config;
