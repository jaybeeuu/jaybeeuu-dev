// E2E test configuration - duplicates posts config for test isolation
import path from "node:path";
import getReadingTime from "reading-time";
import type { CompostConfig, BaseInputMetadata } from "@jaybeeuu/compost";
import type { CheckedBy } from "@jaybeeuu/is";
import { is, isObject } from "@jaybeeuu/is";

export const isPostInputMetadata = isObject({
  title: is("string"),
  abstract: is("string"),
  publish: is("boolean"),
} as const);
export type PostInputMetadata = CheckedBy<typeof isPostInputMetadata> &
  BaseInputMetadata;

const getCompiledPostFileName = (slug: string, html: string): string => {
  let hash = 0;
  for (let i = 0; i < html.length; i++) {
    const char = html.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  const hashString = Math.abs(hash).toString(16);
  return `${slug}-${hashString}.html`;
};

const config: CompostConfig = {
  contentTypes: {
    post: {
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
      mapToManifestEntry: (input, content: string) => {
        const readingTime = getReadingTime(content);
        return {
          title: input.title,
          abstract: input.abstract,
          readingTime,
        };
      },
      sourceDir: "fixtures/src/blog",
      outputDir: "fixtures/blog",
      hrefRoot: "blog",
      includeUnpublished: false,
      codeLineNumbers: true,
      removeH1: true,
      requireOldManifest: false,
      oldManifestLocators: ["fixtures/blog/post-manifest.json"],
    },
  },
};

export default config;
