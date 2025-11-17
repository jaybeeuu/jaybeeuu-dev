import path from "node:path";
import getReadingTime from "reading-time";
import type { CheckedBy } from "@jaybeeuu/is";
import { is, isObject } from "@jaybeeuu/is";
import type { BaseOutputMeta } from "../content/services/manifest/index.js";
import { getCompiledPostFileName } from "../content/file-paths.js";
import type { Manifest } from "../content/services/manifest/manifest-operations.js";
import { isManifest } from "../content/services/manifest/manifest-operations.js";
import type { ContentTypeDefinition } from "../content/content-types.js";

/**
 * Input metadata for post files (from frontmatter/JSON).
 */
export const isPostInputMetadata = isObject({
  title: is("string"),
  abstract: is("string"),
  publish: is("boolean"),
} as const);
export type PostInputMetadata = CheckedBy<typeof isPostInputMetadata>;

/**
 * Reading time calculation result for posts.
 */
export const isReadingTime = isObject({
  text: is("string"),
  time: is("number"),
  words: is("number"),
  minutes: is("number"),
});
export type ReadingTime = CheckedBy<typeof isReadingTime>;

export const isPostOutputMetadata = isObject({
  title: is("string"),
  abstract: is("string"),
  readingTime: isReadingTime,
});
export type PostOutputMetadata = CheckedBy<typeof isPostOutputMetadata>;

export type PostManifestEntry = BaseOutputMeta & PostOutputMetadata;

export type PostManifest = Manifest<PostOutputMetadata>;

export const isPostManifest =
  isManifest<PostOutputMetadata>(isPostOutputMetadata);

/**
 * Content type definition for posts.
 */
export const postContentTypeDefinition = {
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
  mapToOutputMeta: (input: PostInputMetadata, content: string) => {
    const readingTime = getReadingTime(content);
    return {
      title: input.title,
      abstract: input.abstract,
      readingTime,
    };
  },
  sourceDir: "src",
  outputDir: "out",
  hrefRoot: "/",
  includeUnpublished: false,
  codeLineNumbers: false,
  removeH1: false,
} satisfies ContentTypeDefinition<
  "post",
  PostInputMetadata,
  PostOutputMetadata
>;
