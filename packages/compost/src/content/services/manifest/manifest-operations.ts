import type { Result } from "@jaybeeuu/utilities";
import { failure, success } from "@jaybeeuu/utilities";
import path from "node:path";
import { writeJsonFile } from "../../../files/index.js";
import {
  getOldManifest,
  isV1ManifestFile,
  type V1ManifestFile,
} from "./old-manifest.js";
import { getSha1Hex } from "../../../hash.js";
import { generateV1UpgradeHash } from "./v1-upgrade-utils.js";

import {
  is,
  isObject,
  isRecordOf,
  isIntersectionOf,
  isUnionOf,
} from "@jaybeeuu/is";
import type { TypePredicate, CheckedBy } from "@jaybeeuu/is";

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
  slug: is("string"),
});
export type V2Entry = CheckedBy<typeof isV2Entry>;

/**
 * Entry type for new manifests we generate.
 * Always V2 format with content-specific fields.
 */
export type ManifestEntry = V2Entry & { [key: string]: unknown };

export interface V2ManifestFile<
  Metadata extends { [key: string]: unknown } = { [key: string]: unknown },
  CalculatedMetadata extends { [key: string]: unknown } = {
    [key: string]: unknown;
  },
> {
  version: number;
  metadata: {
    generatedAt: string;
    entryCount: number;
    overallHash: string;
  };
  entries: { [slug: string]: V2Entry & Metadata & CalculatedMetadata };
}

export const isV2ManifestFile = <
  Metadata extends { [key: string]: unknown } = { [key: string]: unknown },
  CalculatedMetadata extends { [key: string]: unknown } = {
    [key: string]: unknown;
  },
>(
  entryPredicate?: TypePredicate<V2Entry & Metadata & CalculatedMetadata>,
): TypePredicate<V2ManifestFile<Metadata, CalculatedMetadata>> => {
  const validator = isObject({
    version: is("number"),
    metadata: isObject({
      generatedAt: is("string"),
      entryCount: is("number"),
      overallHash: is("string"),
    }),
    entries: isRecordOf(entryPredicate ?? isV2Entry),
  });
  return validator as TypePredicate<
    V2ManifestFile<Metadata, CalculatedMetadata>
  >;
};

export const isV2ManifestFileWithContentValidation = (
  contentValidator: TypePredicate<object>,
) => {
  const composedEntryValidator = isIntersectionOf(isV2Entry, contentValidator);
  return isObject({
    version: is("number"),
    metadata: isObject({
      generatedAt: is("string"),
      entryCount: is("number"),
      overallHash: is("string"),
    }),
    entries: isRecordOf(composedEntryValidator),
  });
};

export interface LoadedManifestData {
  readonly oldManifests: ReadonlyMap<string, ReadonlyMap<string, V2Entry>>;
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

export async function loadManifestData(contentConfigs: {
  [contentType: string]: {
    outputDir: string;
    manifestFileName: string;
    oldManifestLocators: string[];
    requireOldManifest: boolean;
    validator: TypePredicate<object>;
  };
}): Promise<Result<LoadedManifestData, string>> {
  try {
    const oldManifests = new Map<string, Map<string, V2Entry>>();

    for (const [contentType, contentConfig] of Object.entries(contentConfigs)) {
      const manifestResult = await loadManifestForContentType(
        contentType,
        contentConfig,
      );

      if (!manifestResult.success) {
        if (contentConfig.requireOldManifest) {
          return failure(
            "manifest load failed",
            `Failed to load required manifest for ${contentType}: ${manifestResult.message}`,
          );
        } else {
          // Set empty manifest for this content type
          oldManifests.set(contentType, new Map());
        }
      } else {
        oldManifests.set(contentType, manifestResult.value);
      }
    }

    return success({
      oldManifests: oldManifests as ReadonlyMap<
        string,
        ReadonlyMap<string, V2Entry>
      >,
    });
  } catch (error) {
    return failure(
      "manifest load failed",
      `Failed to load manifests: ${String(error)}`,
    );
  }
}

async function loadManifestForContentType(
  contentType: string,
  contentConfig: {
    outputDir: string;
    manifestFileName: string;
    oldManifestLocators: string[];
    validator: TypePredicate<object>;
  },
): Promise<Result<Map<string, V2Entry>, string>> {
  const manifestPath = path.resolve(
    contentConfig.outputDir,
    contentConfig.manifestFileName,
  );

  const oldManifestLocators = [...contentConfig.oldManifestLocators];

  const result = await getOldManifest(manifestPath, oldManifestLocators);

  if (!result.success) {
    return failure("manifest load failed", result.message);
  }

  const manifestData = result.value;
  const entriesMap = new Map<string, V2Entry>();

  const v2Validator = isV2ManifestFileWithContentValidation(
    contentConfig.validator,
  );

  if (v2Validator(manifestData)) {
    for (const [slug, entry] of Object.entries(manifestData.entries)) {
      entriesMap.set(slug, entry as V2Entry);
    }
  } else if (isV1ManifestFile(manifestData)) {
    const v1Manifest = manifestData as V1ManifestFile;
    for (const [slug, v1Entry] of Object.entries(v1Manifest)) {
      const upgradedEntry: V2Entry = {
        ...v1Entry,
        hash: generateV1UpgradeHash(v1Entry.fileName),
        slug,
      };
      entriesMap.set(slug, upgradedEntry);
    }
  } else {
    return failure(
      "manifest load failed",
      `Invalid manifest format for ${contentType}: not recognized as V1 or V2 format`,
    );
  }

  return success(entriesMap);
}

export function getOldManifestEntries(
  manifestData: LoadedManifestData,
  contentType: string,
): ReadonlyMap<string, V2Entry> {
  return manifestData.oldManifests.get(contentType) ?? new Map();
}

export function createManifestBuilder(): ManifestBuilder {
  return { entries: new Map() };
}

export function addManifestEntry(
  builder: ManifestBuilder,
  contentType: string,
  slug: string,
  manifestEntry: ManifestEntry,
): ManifestBuilder {
  const newEntries = new Map(builder.entries);
  const contentTypeEntries = new Map(newEntries.get(contentType) ?? new Map());
  contentTypeEntries.set(slug, manifestEntry);
  newEntries.set(contentType, contentTypeEntries);

  return { entries: newEntries };
}

export async function writeManifests(
  builder: ManifestBuilder,
  contentConfigs: {
    [contentType: string]: { outputDir: string; manifestFileName: string };
  },
): Promise<Result<void, string>> {
  try {
    for (const [contentType, entries] of builder.entries) {
      const contentConfig = contentConfigs[contentType];
      if (!contentConfig) {
        return failure(
          "configuration error",
          `No configuration found for content type: ${contentType}`,
        );
      }

      const writeResult = await writeManifestFile(entries, contentConfig);
      if (!writeResult.success) {
        return writeResult;
      }
    }

    return success();
  } catch (error) {
    return failure(
      "manifest update failed",
      `Failed to update manifests: ${String(error)}`,
    );
  }
}

async function writeManifestFile(
  entries: ReadonlyMap<string, ManifestEntry>,
  contentConfig: { outputDir: string; manifestFileName: string },
): Promise<Result<void, string>> {
  const manifestPath = path.resolve(
    contentConfig.outputDir,
    contentConfig.manifestFileName,
  );

  const manifestObject = Object.fromEntries(entries);

  const entriesHash = generateHash(
    JSON.stringify(manifestObject, Object.keys(manifestObject).sort()),
  );

  const versionedManifest = {
    version: 2,
    metadata: {
      generatedAt: new Date().toISOString(),
      entryCount: entries.size,
      overallHash: entriesHash,
    },
    entries: manifestObject,
  };

  await writeJsonFile(manifestPath, versionedManifest);
  return success();
}

export function getOldManifestsForAllContentTypes(
  manifestData: LoadedManifestData,
  contentConfig: { [contentType: string]: unknown },
): { [contentType: string]: OldManifest } {
  const allOldManifests: { [contentType: string]: OldManifest } = {};

  for (const contentType of Object.keys(contentConfig)) {
    const entries = getOldManifestEntries(manifestData, contentType);
    allOldManifests[contentType] = Object.fromEntries(entries) as OldManifest;
  }

  return allOldManifests;
}

export function getManifestMap(builder: ManifestBuilder): ProcessingManifest {
  const result: ProcessingManifest = {};
  for (const [contentType, entries] of builder.entries) {
    result[contentType] = Object.fromEntries(entries);
  }
  return result;
}

export function buildManifest<
  Metadata extends { [key: string]: unknown },
  CalculatedMetadata extends { [key: string]: unknown },
>(
  entries: Map<string, V2Entry & Metadata & CalculatedMetadata>,
): V2ManifestFile<Metadata, CalculatedMetadata> {
  const entriesObject = Object.fromEntries(entries);
  const entriesHash = generateHash(
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

export type V2Manifest<
  Metadata extends { [key: string]: unknown } = { [key: string]: unknown },
  CalculatedMetadata extends { [key: string]: unknown } = {
    [key: string]: unknown;
  },
> = V2ManifestFile<Metadata, CalculatedMetadata>;

export type WriteManifestFailureReason = "manifest write failed";

export async function writeManifest<
  Metadata extends { [key: string]: unknown },
  CalculatedMetadata extends { [key: string]: unknown },
>(
  contentType: string,
  manifest: V2ManifestFile<Metadata, CalculatedMetadata>,
  config: { outputDir: string; manifestFileName: string },
): Promise<Result<void, WriteManifestFailureReason>> {
  try {
    const path = await import("node:path");
    const { writeJsonFile } = await import("../../../files/index.js");

    const manifestPath = path.default.resolve(
      config.outputDir,
      config.manifestFileName,
    );

    await writeJsonFile(manifestPath, manifest);
    return success(undefined);
  } catch (error) {
    return failure(
      "manifest write failed",
      `Failed to write manifest for ${contentType}: ${error}`,
    );
  }
}

function generateHash(content: string): string {
  return getSha1Hex(content);
}
