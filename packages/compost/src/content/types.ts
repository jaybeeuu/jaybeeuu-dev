import type { CheckedBy } from "@jaybeeuu/is";
import { is, isObject, isUnionOf } from "@jaybeeuu/is";

/**
 * V1 manifest entry (legacy format without hash).
 */
export const isV1Entry = isObject({
  fileName: is("string"),
  href: is("string"),
  lastUpdateDate: isUnionOf(is("string"), is("null")),
  publishDate: is("string"),
});
export type V1Entry = CheckedBy<typeof isV1Entry>;

/**
 * V2 manifest entry (current format with hash).
 */
export const isV2Entry = isObject({
  fileName: is("string"),
  href: is("string"),
  lastUpdateDate: isUnionOf(is("string"), is("null")),
  publishDate: is("string"),
  hash: is("string"),
});
export type V2Entry = CheckedBy<typeof isV2Entry>;

/**
 * Entry type for new manifests we generate.
 * Always V2 format with content-specific fields.
 */
export type ManifestEntry = V2Entry & { [key: string]: unknown };
