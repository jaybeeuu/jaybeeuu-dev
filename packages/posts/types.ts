import {
  Manifest,
  ManifestEntry,
  isManifest,
} from "@jaybeeuu/compost/manifest";
import { type CheckedBy, type TypePredicate, is, isObject } from "@jaybeeuu/is";

const isReadingTime = isObject({
  text: is("string"),
  time: is("number"),
  words: is("number"),
  minutes: is("number"),
});

export const isPostInputMetadata = isObject({
  abstract: is("string"),
});
export type PostInputMetadata = CheckedBy<typeof isPostInputMetadata>;

export const isPostManifestEntryCustomProperties = isObject({
  abstract: is("string"),
  readingTime: isReadingTime,
});
export type PostManifestEntryCustomProperties = CheckedBy<
  typeof isPostManifestEntryCustomProperties
>;

export type PostManifestEntry =
  ManifestEntry<PostManifestEntryCustomProperties>;
export type PostManifest = Manifest<PostManifestEntryCustomProperties>;

export const isPostManifest: TypePredicate<PostManifest> = isManifest(
  isPostManifestEntryCustomProperties,
);
