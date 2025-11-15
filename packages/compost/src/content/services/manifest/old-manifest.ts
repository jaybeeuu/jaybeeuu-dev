import type { Failure, Result } from "@jaybeeuu/utilities";
import { failure } from "@jaybeeuu/utilities";
import type {
  FetchJsonFileFailureReason,
  ReadJsonFileFailureReason,
} from "../../../files/index.js";
import { fetchJsonFile, readJsonFile } from "../../../files/index.js";
import {
  isBaseOutputMeta,
  type V1BaseOutputMeta,
  type BaseOutputMeta,
} from "./manifest-operations.js";
import { is, isObject, isRecordOf, isUnionOf } from "@jaybeeuu/is";
import { isManifest } from "./manifest-operations.js";
import { generateV1UpgradeHash } from "./v1-upgrade-utils.js";

export type GetOldManifestFailureReason = "read manifest failed";

/**
 * V1 manifest file format (flat object).
 */
export type V1ManifestFile = { [slug: string]: V1BaseOutputMeta };

export const isV1ManifestFile = isRecordOf(
  isObject({
    fileName: is("string"),
    href: is("string"),
    lastUpdateDate: isUnionOf(is("string"), is("null")),
    publishDate: is("string"),
  }),
);

/**
 * Upgrade v1 manifest entries to v2 format by adding hash field
 */
const upgradeV1Manifest = (v1Manifest: {
  [slug: string]: V1BaseOutputMeta;
}): { [key: string]: BaseOutputMeta } => {
  const upgradedEntries: { [key: string]: BaseOutputMeta } = {};

  for (const [slug, entry] of Object.entries(v1Manifest)) {
    upgradedEntries[slug] = {
      ...entry,
      hash: generateV1UpgradeHash(entry.fileName),
      slug,
    };
  }

  return upgradedEntries;
};

const getManifestFromOldManifestLocator = async (
  manifestLocator: string,
): Promise<
  Result<
    { [key: string]: BaseOutputMeta },
    FetchJsonFileFailureReason | ReadJsonFileFailureReason
  >
> => {
  const readResult = /^https?/.test(manifestLocator)
    ? await fetchJsonFile(manifestLocator, is("object"))
    : await readJsonFile(manifestLocator, is("object"));

  if (!readResult.success) {
    return readResult;
  }

  const data = readResult.value;

  // Test V2 format first using schema validation
  const v2Validator = isManifest(isBaseOutputMeta);
  if (v2Validator(data)) {
    // V2 format - extract the entries (already have hash fields)
    return { success: true, value: data.entries };
  }

  // Test V1 format using schema validation
  if (isV1ManifestFile(data)) {
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
): Promise<
  Result<{ [key: string]: BaseOutputMeta }, GetOldManifestFailureReason>
> => {
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

export const getOldManifestWithFallback = async (
  manifestOutputFileName: string,
  manifestLocators: string[],
  required: boolean,
): Promise<
  Result<{ [key: string]: BaseOutputMeta }, GetOldManifestFailureReason>
> => {
  const result = await getOldManifest(manifestOutputFileName, manifestLocators);

  if (!result.success && !required) {
    // If not required and failed, return empty manifest instead of failure
    return { success: true, value: {} };
  }

  return result;
};
