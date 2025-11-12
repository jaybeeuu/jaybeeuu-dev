import type { Result } from "@jaybeeuu/utilities";
import { failure, success } from "@jaybeeuu/utilities";
import path from "node:path";
import { writeJsonFile } from "../../../files/index.js";
import {
  getOldManifest,
  isV1ManifestFile,
  type V1ManifestFile,
} from "./old-manifest.js";
import { contentResolverConfig } from "../../content-types.js";
import { getSha1Hex } from "../../../hash.js";

import type { V1Entry, V2Entry, ManifestEntry } from "../../types.js";
import { isV2Entry } from "../../types.js";
import { is, isObject, isRecordOf, isIntersectionOf } from "@jaybeeuu/is";
import type { TypePredicate } from "@jaybeeuu/is";

/**
 * V2 manifest file format (versioned wrapper).
 * Generic to allow for different content type entry structures.
 */
export interface V2ManifestFile<TEntry extends V2Entry = V2Entry> {
  version: number;
  metadata: {
    generatedAt: string;
    entryCount: number;
    overallHash: string;
  };
  entries: { [slug: string]: TEntry };
}

/**
 * Validator for V2 manifest file format.
 * Can optionally compose V2Entry with content-specific metadata validation.
 */
export const isV2ManifestFile = <TEntry extends V2Entry = V2Entry>(
  entryPredicate?: TypePredicate<TEntry>,
) =>
  isObject({
    version: is("number"),
    metadata: isObject({
      generatedAt: is("string"),
      entryCount: is("number"),
      overallHash: is("string"),
    }),
    entries: isRecordOf(entryPredicate ?? isV2Entry),
  });

/**
 * Validator for V2 manifest file format with composed entry validation.
 * Composes V2Entry base structure with content-specific metadata.
 */
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

/**
 * Immutable structure containing loaded old manifest data.
 * No temporal dependencies - all data is loaded upfront.
 */
export interface LoadedManifestData {
  readonly oldManifests: ReadonlyMap<string, ReadonlyMap<string, V2Entry>>;
}

/**
 * Immutable structure for building new manifests.
 * Functional approach - operations return new instances.
 */
export interface ManifestBuilder {
  readonly entries: ReadonlyMap<string, ReadonlyMap<string, ManifestEntry>>;
}

/**
 * Maps content types to their NEW manifest structures (for return value compatibility).
 */
export interface ProcessingManifest {
  [contentType: string]: { [slug: string]: ManifestEntry };
}

/**
 * Legacy manifest entry structure from content processor.
 */
export interface OldManifestEntry {
  fileName?: string;
  hash?: string; // Present in V2, may be missing in legacy V1 entries
  publishDate?: string | Date;
  lastUpdateDate?: string | Date | null;
  [key: string]: unknown;
}

/**
 * Type for old manifests used in change detection.
 */
export type OldManifest = { [slug: string]: OldManifestEntry };

/**
 * Load all existing manifests for change detection.
 * Pure function - returns all loaded data with no hidden state.
 *
 * @param contentConfigs - Content configurations with manifest settings
 * @returns Promise resolving to loaded manifest data or failure
 */
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

/**
 * Load manifest for a specific content type.
 *
 * @param contentType - The content type to load
 * @param contentConfig - Content configuration with manifest settings
 * @returns Promise resolving to loaded entries or failure
 */
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

  // Use content-specific old manifest locators
  const oldManifestLocators = [...contentConfig.oldManifestLocators];

  const result = await getOldManifest(manifestPath, oldManifestLocators);

  if (!result.success) {
    return failure("manifest load failed", result.message);
  }

  // Convert the result to a Map for easier manipulation
  const manifestData = result.value;
  const entriesMap = new Map<string, V2Entry>();

  // Handle both versioned (v2+) and legacy (v1) manifest formats using proper schema validation
  // Use content-specific validation that composes V2Entry with content metadata
  const v2Validator = isV2ManifestFileWithContentValidation(
    contentConfig.validator,
  );

  if (v2Validator(manifestData)) {
    // V2 format - extract the entries (already have hash fields)
    // Type assertion is safe here because we just validated the structure
    for (const [slug, entry] of Object.entries(manifestData.entries)) {
      entriesMap.set(slug, entry as V2Entry);
    }
  } else if (isV1ManifestFile(manifestData)) {
    // V1 format - upgrade entries by adding hash fields inline
    const v1Manifest = manifestData as V1ManifestFile;
    for (const [slug, v1Entry] of Object.entries(v1Manifest)) {
      const upgradedEntry: V2Entry = {
        ...v1Entry,
        hash: getSha1Hex(`v1-upgrade-${v1Entry.fileName}`), // Simple hash generation
      };
      entriesMap.set(slug, upgradedEntry);
    }
  } else {
    // Neither V1 nor V2 format - validation failed
    return failure(
      "manifest load failed",
      `Invalid manifest format for ${contentType}: not recognized as V1 or V2 format`,
    );
  }

  return success(entriesMap);
}

/**
 * Get the old manifest entries for a specific content type.
 * Pure function - no side effects, explicit dependencies.
 *
 * @param manifestData - The loaded manifest data
 * @param contentType - The content type to get entries for
 * @returns The old manifest entries or empty map if not found
 */
export function getOldManifestEntries(
  manifestData: LoadedManifestData,
  contentType: string,
): ReadonlyMap<string, V2Entry> {
  return manifestData.oldManifests.get(contentType) ?? new Map();
}

/**
 * Create a new manifest builder.
 * Pure function - returns empty builder state.
 *
 * @returns A new manifest builder
 */
export function createManifestBuilder(): ManifestBuilder {
  return { entries: new Map() };
}

/**
 * Add a manifest entry to the builder.
 * Pure function - returns new builder instance with added entry.
 *
 * @param builder - The current manifest builder
 * @param contentType - The content type
 * @param slug - The content slug
 * @param manifestEntry - The manifest entry to add
 * @returns New builder instance with the added entry
 */
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

/**
 * Write all manifests with version information.
 * Pure function - takes explicit builder state, no hidden dependencies.
 *
 * @param builder - The manifest builder containing entries to write
 * @param contentConfigs - Content configurations with manifest settings
 * @returns Promise resolving to success or failure
 */
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

/**
 * Write a manifest file for a specific content type.
 *
 * @param entries - The manifest entries
 * @param contentConfig - Content configuration with manifest settings
 * @returns Promise resolving to success or failure
 */
async function writeManifestFile(
  entries: ReadonlyMap<string, ManifestEntry>,
  contentConfig: { outputDir: string; manifestFileName: string },
): Promise<Result<void, string>> {
  const manifestPath = path.resolve(
    contentConfig.outputDir,
    contentConfig.manifestFileName,
  );

  // Convert entries to object for JSON serialization
  const manifestObject = Object.fromEntries(entries);

  const entriesHash = generateHash(
    JSON.stringify(manifestObject, Object.keys(manifestObject).sort()),
  );

  const versionedManifest = {
    version: 2, // Version 2 includes content hashes for change detection
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

/**
 * Convert loaded manifest data to the legacy format expected by content processors.
 * Pure function - no side effects, explicit dependencies.
 *
 * @param manifestData - The loaded manifest data
 * @param contentConfig - Content configuration to determine which types to include
 * @returns Object mapping content types to their old manifest entries
 */
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

/**
 * Get the final manifests in the expected format (for backward compatibility).
 * Pure function - converts builder to legacy format.
 *
 * @param builder - The manifest builder
 * @returns The manifests in the legacy format
 */
export function getManifestMap(builder: ManifestBuilder): ProcessingManifest {
  const result: ProcessingManifest = {};
  for (const [contentType, entries] of builder.entries) {
    result[contentType] = Object.fromEntries(entries);
  }
  return result;
}

/**
 * Generate SHA1 hash for content.
 *
 * @param content - Content to hash
 * @returns SHA1 hash string
 */
function generateHash(content: string): string {
  return getSha1Hex(content);
}
