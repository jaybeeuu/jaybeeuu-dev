import type { Result } from "@jaybeeuu/utilities";
import { failure, success } from "@jaybeeuu/utilities";
import { getSha1Hex } from "../../../hash.js";

import {
  is,
  isObject,
  isRecordOf,
  isIntersectionOf,
  isUnionOf,
} from "@jaybeeuu/is";
import type { TypePredicate, CheckedBy } from "@jaybeeuu/is";

/**
 * V1 base output metadata (legacy format without hash).
 */
export const isV1BaseOutputMeta = isObject({
  fileName: is("string"),
  href: is("string"),
  lastUpdateDate: isUnionOf(is("string"), is("null")),
  publishDate: is("string"),
});
export type V1BaseOutputMeta = CheckedBy<typeof isV1BaseOutputMeta>;

/**
 * Base output metadata for all manifest entries (current format with hash).
 */
export const isBaseOutputMeta = isObject({
  fileName: is("string"),
  href: is("string"),
  lastUpdateDate: isUnionOf(is("string"), is("null")),
  publishDate: is("string"),
  hash: is("string"),
  slug: is("string"),
});
export type BaseOutputMeta = CheckedBy<typeof isBaseOutputMeta>;

/**
 * Entry type for new manifests we generate.
 * Always includes base output metadata with content-specific fields.
 */
export type ManifestEntry = BaseOutputMeta & UnknownRecord;

export const isManifest = <Metadata = UnknownRecord>(
  entryPredicate: TypePredicate<Metadata>,
): TypePredicate<Manifest<Metadata>> => {
  return isObject({
    version: is("number"),
    metadata: isObject({
      generatedAt: is("string"),
      entryCount: is("number"),
      overallHash: is("string"),
    }),
    entries: isRecordOf(isIntersectionOf(entryPredicate, isBaseOutputMeta)),
  }) as TypePredicate<Manifest<Metadata>>;
};

export type Manifest<Metadata = UnknownRecord> = {
  version: number;
  metadata: {
    generatedAt: string;
    entryCount: number;
    overallHash: string;
  };
  entries: {
    [slug: string]: BaseOutputMeta & Metadata;
  };
};

export const isV2ManifestFileWithContentValidation = (
  contentValidator: TypePredicate<object>,
): TypePredicate<Manifest> => {
  const composedEntryValidator = isIntersectionOf(
    isBaseOutputMeta,
    contentValidator,
  );
  return isObject({
    version: is("number"),
    metadata: isObject({
      generatedAt: is("string"),
      entryCount: is("number"),
      overallHash: is("string"),
    }),
    entries: isRecordOf(composedEntryValidator),
  }) as TypePredicate<Manifest>;
};

export interface LoadedManifestData {
  readonly oldManifests: ReadonlyMap<
    string,
    ReadonlyMap<string, BaseOutputMeta>
  >;
}

export interface ManifestBuilder {
  readonly entries: ReadonlyMap<string, ReadonlyMap<string, ManifestEntry>>;
}

export interface ProcessingManifest {
  [contentType: string]: { [slug: string]: ManifestEntry };
}

export interface OldManifestEntry {
  fileName?: string;
  hash?: string; // Present in V2, may be missing in legacy V1 entries
  publishDate?: string | Date;
  lastUpdateDate?: string | Date | null;
  [key: string]: unknown;
}

export type OldManifest = { [slug: string]: OldManifestEntry };

export function buildManifest<Metadata, CalculatedMetadata>(
  entries: Map<string, BaseOutputMeta & Metadata & CalculatedMetadata>,
): Manifest<Metadata> {
  const entriesObject = Object.fromEntries(entries);
  const entriesHash = getSha1Hex(
    JSON.stringify(entriesObject, Object.keys(entriesObject).sort()),
  );

  return {
    version: 2,
    metadata: {
      generatedAt: new Date().toISOString(),
      entryCount: entries.size,
      overallHash: entriesHash,
    },
    entries: entriesObject,
  };
}

export type WriteManifestFailureReason = "manifest write failed";

export async function writeManifest<Metadata>(
  contentType: string,
  manifest: Manifest<Metadata>,
  config: { outputDir: string; manifestFileName: string },
): Promise<Result<void, WriteManifestFailureReason>> {
  try {
    const pathModule = await import("node:path");
    const { writeJsonFile: writeJsonFileFunc } = await import(
      "../../../files/index.js"
    );

    const manifestPath = pathModule.default.resolve(
      config.outputDir,
      config.manifestFileName,
    );

    await writeJsonFileFunc(manifestPath, manifest);
    return success(undefined);
  } catch (error) {
    return failure(
      "manifest write failed",
      `Failed to write manifest for ${contentType}: ${String(error)}`,
    );
  }
}
