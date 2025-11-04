import type { Failure, Result } from "@jaybeeuu/utilities";
import { failure } from "@jaybeeuu/utilities";
import type {
  FetchJsonFileFailureReason,
  ReadJsonFileFailureReason,
} from "../files/index.js";
import { fetchJsonFile, readJsonFile } from "../files/index.js";
import {
  isV1Manifest,
  isV2Manifest,
  type V1Manifest,
  type V2Metadata,
} from "./types.js";
import { is } from "@jaybeeuu/is";
import crypto from "crypto";

export type GetOldManifestFailureReason = "read manifest failed";

/**
 * Extract hash from filename for v1 manifest upgrade.
 * Generates a hash based on the filename to provide a reasonable
 * approximation for change detection during v1→v2 migration.
 */
const extractHashFromFilename = (fileName: string, slug: string): string => {
  // Pattern: slug-hash.html where hash is typically 6-8 characters
  const pattern = new RegExp(`^${escapeRegExp(slug)}-(\\w+)\\.html$`);
  const match = fileName.match(pattern);

  if (match && match[1]) {
    // Use the filename hash as a basis for the v2 hash
    // This provides reasonable change detection for most cases
    return crypto
      .createHash("md5")
      .update(`v1-upgrade-${match[1]}`)
      .digest("hex");
  }

  // Fallback: generate hash from the entire filename
  return crypto
    .createHash("md5")
    .update(`v1-upgrade-${fileName}`)
    .digest("hex");
};

/**
 * Escape special regex characters in string
 */
const escapeRegExp = (string: string): string => {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Upgrade v1 manifest entries to v2 format by adding hash field
 */
const upgradeV1Manifest = (
  v1Manifest: V1Manifest,
): Record<string, V2Metadata> => {
  const upgradedEntries: Record<string, V2Metadata> = {};

  for (const [slug, entry] of Object.entries(v1Manifest)) {
    upgradedEntries[slug] = {
      ...entry,
      hash: extractHashFromFilename(entry.fileName, slug),
    };
  }

  return upgradedEntries;
};

const getManifestFromOldManifestLocator = async (
  manifestLocator: string,
): Promise<
  Result<
    Record<string, V2Metadata>,
    FetchJsonFileFailureReason | ReadJsonFileFailureReason
  >
> => {
  // First try to read the file without validation to handle both v1 and v2 formats
  const readResult = /^https?/.test(manifestLocator)
    ? await fetchJsonFile(manifestLocator, is("object"))
    : await readJsonFile(manifestLocator, is("object"));

  if (!readResult.success) {
    return readResult;
  }

  const data = readResult.value;

  // Use version field to determine which validation to apply
  if (typeof data === "object" && data !== null && "version" in data) {
    // Has version field - validate as v2 manifest
    if (isV2Manifest(data)) {
      // V2 format - extract the entries (already have hash fields)
      return { success: true, value: data.entries };
    } else {
      return failure(
        "validation failed" as ReadJsonFileFailureReason,
        "Invalid v2 manifest format",
      );
    }
  }

  // No version field - check if it's v1 format and upgrade
  if (isV1Manifest(data)) {
    // V1 format - upgrade to v2 by adding hash fields
    const upgradedManifest = upgradeV1Manifest(data);
    return { success: true, value: upgradedManifest };
  }

  // If neither format matches, return validation error
  return failure(
    "validation failed" as ReadJsonFileFailureReason,
    "Manifest format not recognized as v1 or v2",
  );
};

export const getOldManifest = async (
  manifestOutputFileName: string,
  manifestLocators: string[],
): Promise<Result<Record<string, V2Metadata>, GetOldManifestFailureReason>> => {
  const defaultedManifestLocators = [
    ...manifestLocators,
    manifestOutputFileName,
  ];
  const failures: Failure<
    FetchJsonFileFailureReason | ReadJsonFileFailureReason
  >[] = [];

  for (const manifestLocator of defaultedManifestLocators) {
    const result = await getManifestFromOldManifestLocator(manifestLocator);
    if (result.success) {
      return result;
    }

    failures.push(result);
  }

  return failure(
    "read manifest failed",
    failures.map((fail) => fail.stack ?? fail.message).join("\n"),
  );
};
