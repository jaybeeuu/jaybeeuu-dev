import type { CheckedBy } from "@jaybeeuu/is";
import { is, isObject, isUnionOf, isRecordOf } from "@jaybeeuu/is";

/**
 * Reading time calculation result for posts.
 */
const isReadingTime = isObject({
  text: is("string"),
  time: is("number"),
  words: is("number"),
  minutes: is("number"),
});
type ReadingTime = CheckedBy<typeof isReadingTime>;

/**
 * Base output metadata fields that all content types have
 */
interface BaseOutputMeta {
  readonly fileName: string;
  readonly href: string;
  readonly publishDate: string;
  readonly lastUpdateDate: string | null;
  readonly slug: string;
  readonly hash: string;
}

/**
 * Individual post entry in the manifest
 */
export interface PostManifestEntry extends BaseOutputMeta {
  readonly title: string;
  readonly abstract: string;
  readonly readingTime: ReadingTime;
}

export const isPostManifestEntry = isObject({
  fileName: is("string"),
  href: is("string"),
  publishDate: is("string"),
  lastUpdateDate: isUnionOf(is("string"), is("null")),
  slug: is("string"),
  hash: is("string"),
  title: is("string"),
  abstract: is("string"),
  readingTime: isReadingTime,
});

/**
 * Complete post manifest structure
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

export const isPostManifest = isObject({
  version: is("number"),
  metadata: isObject({
    generatedAt: is("string"),
    entryCount: is("number"),
    overallHash: is("string"),
  }),
  entries: isRecordOf(isPostManifestEntry),
});
