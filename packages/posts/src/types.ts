import type { CheckedBy } from "@jaybeeuu/is";
import { is, isObject } from "@jaybeeuu/is";

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

/**
 * Base output metadata fields that all content types have
 */
export interface BaseOutputMeta {
  readonly fileName: string;
  readonly href: string;
  readonly publishDate: string;
  readonly lastUpdateDate: string | null;
  readonly slug: string;
  readonly hash: string;
}

export type PostManifestEntry = BaseOutputMeta & PostOutputMetadata;

/**
 * Manifest structure with versioning
 */
export interface PostManifest {
  readonly version: number;
  readonly metadata: {
    readonly generatedAt: string;
    readonly entryCount: number;
    readonly overallHash: string;
  };
  readonly entries: { [slug: string]: PostManifestEntry };
}
