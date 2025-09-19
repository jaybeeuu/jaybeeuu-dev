import type { CheckedBy } from "@jaybeeuu/is";
import { is, isIntersectionOf, isObject, isRecordOf } from "@jaybeeuu/is";
import { isMetadata, type Manifest } from "../../types";

export const isReadingTime = isObject({
  text: is("string"),
  time: is("number"),
  words: is("number"),
  minutes: is("number"),
});
export type ReadingTime = CheckedBy<typeof isReadingTime>;

export const isPostMetadata = isIntersectionOf(
  isMetadata,
  isObject({
    abstract: is("string"),
    slug: is("string"),
    title: is("string"),
    publish: is("boolean"),
    readingTime: isReadingTime,
  }),
);
export type PostMetadata = CheckedBy<typeof isPostMetadata>;

export type PostManifest = Manifest<PostMetadata>;
export const isPostManifest = isRecordOf(isPostMetadata);

export type PostMetaFileData = Pick<
  PostMetadata,
  "abstract" | "title" | "publish"
>;
