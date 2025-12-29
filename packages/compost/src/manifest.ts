import {
  is,
  isObject,
  isRecordOf,
  isIntersectionOf,
  isUnionOf,
  isLiteral,
} from "@jaybeeuu/is";
import type { TypePredicate, CheckedBy } from "@jaybeeuu/is";

/**
 * Base output metadata for all manifest entries (current format with hash).
 */
export const isBaseManifestEntry = isObject({
  title: is("string"),
  fileName: is("string"),
  href: is("string"),
  lastUpdateDate: isUnionOf(is("string"), is("null")),
  publishDate: is("string"),
  hash: is("string"),
  slug: is("string"),
});
export type BaseManifestEntry = CheckedBy<typeof isBaseManifestEntry>;

export const isManifestEntry = <
  CustomManifestEntryProperties = BaseManifestEntry,
>(
  entryPredicate: TypePredicate<CustomManifestEntryProperties>,
): TypePredicate<ManifestEntry<CustomManifestEntryProperties>> => {
  return isIntersectionOf(entryPredicate, isBaseManifestEntry) as TypePredicate<
    ManifestEntry<CustomManifestEntryProperties>
  >;
};

export const isManifest = <CustomManifestEntryProperties = BaseManifestEntry>(
  customEntryProsPredicate: TypePredicate<
    Omit<CustomManifestEntryProperties, keyof BaseManifestEntry>
  >,
): TypePredicate<Manifest<CustomManifestEntryProperties>> => {
  return isObject({
    version: isLiteral(2),
    metadata: isObject({
      generatedAt: is("string"),
      entryCount: is("number"),
      overallHash: is("string"),
    }),
    entries: isRecordOf(isManifestEntry(customEntryProsPredicate)),
  }) as TypePredicate<Manifest<CustomManifestEntryProperties>>;
};

export type ManifestEntry<CustomManifestEntryProperties = BaseManifestEntry> =
  BaseManifestEntry & CustomManifestEntryProperties;

export type Manifest<CustomManifestEntryProperties = BaseManifestEntry> = {
  version: 2;
  metadata: {
    generatedAt: string;
    entryCount: number;
    overallHash: string;
  };
  entries: {
    [slug: string]: ManifestEntry<CustomManifestEntryProperties>;
  };
};
