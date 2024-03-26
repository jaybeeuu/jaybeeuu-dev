import type { CheckedBy } from "@jaybeeuu/utilities";
import { is, isObject, isUnion, isRecordOf } from "@jaybeeuu/utilities";

export interface ReadingTime {
  text: string;
  time: number;
  words: number;
  minutes: number;
}

export interface PostMetaData {
  abstract: string;
  fileName: string;
  href: string;
  lastUpdateDate: string | null;
  publishDate: string;
  slug: string;
  title: string;
  publish: boolean;
  readingTime: ReadingTime;
}

export interface PostManifest {
  [slug: string]: PostMetaData;
}

export type OldPostMetaData = Pick<
  PostMetaData,
  "fileName" | "publishDate" | "lastUpdateDate"
>;

const isOldPostMetaData = isObject<OldPostMetaData>({
  fileName: is("string"),
  lastUpdateDate: isUnion(is("string"), is("null")),
  publishDate: is("string"),
});

export const isOldManifest = isRecordOf(isOldPostMetaData);
export type OldPostManifest = CheckedBy<typeof isOldManifest>;

export interface PostRedirectsMap {
  [oldHash: string]: string;
}

export interface UpdateOptions {
  additionalWatchPaths: string[];
  hrefRoot: string;
  includeUnpublished: boolean;
  codeLineNumbers: boolean;
  manifestFileName: string;
  oldManifestLocators: string[];
  outputDir: string;
  requireOldManifest: boolean;
  sourceDir: string;
  watch: boolean;
  removeH1: boolean;
}
