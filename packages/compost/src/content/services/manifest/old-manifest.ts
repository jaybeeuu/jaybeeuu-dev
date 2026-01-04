import type { Failure, Result } from "@jaybeeuu/utilities";
import { failure } from "@jaybeeuu/utilities";
import {
  type FetchJsonFileFailureReason,
  type ReadJsonFileFailureReason,
  fetchJsonFile,
  readJsonFile,
} from "../../../files/index.js";
import {
  type CheckedBy,
  is,
  isObject,
  isRecordOf,
  isUnionOf,
} from "@jaybeeuu/is";
import { isBaseManifestEntry, isManifest } from "../../../manifest.js";

export type GetOldManifestFailureReason = "read manifest failed";

const isOldManifestEntry = isObject({
  fileName: is("string"),
  publishDate: is("string"),
  lastUpdateDate: isUnionOf(is("string"), is("null")),
  hash: is("string").optional(),
});
export type OldManifestEntry = CheckedBy<typeof isOldManifestEntry>;

const isOldManifestEntries = isRecordOf(isOldManifestEntry);
export type OldManifestEntries = CheckedBy<typeof isOldManifestEntries>;

const getManifestFromOldManifestLocator = async (
  manifestLocator: string,
): Promise<
  Result<
    OldManifestEntries,
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

  const v2Validator = isManifest(isBaseManifestEntry);
  if (v2Validator(data)) {
    return { success: true, value: data.entries };
  }

  if (isOldManifestEntries(data)) {
    return { success: true, value: data };
  }

  return failure(
    "validation failed" as ReadJsonFileFailureReason,
    "Manifest format not recognized as v1 or v2",
  );
};

export const getOldManifestEntries = async (
  manifestOutputFileName: string,
  manifestLocators: string[],
): Promise<Result<OldManifestEntries, GetOldManifestFailureReason>> => {
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

export const getOldManifestEntriesWithFallback = async (
  manifestOutputFileName: string,
  manifestLocators: string[],
  required: boolean,
): Promise<Result<OldManifestEntries, GetOldManifestFailureReason>> => {
  const result = await getOldManifestEntries(
    manifestOutputFileName,
    manifestLocators,
  );

  if (!result.success && !required) {
    // If not required and failed, return empty manifest instead of failure
    return { success: true, value: {} };
  }

  return result;
};

export function detectContentChange(
  oldEntry: OldManifestEntry | undefined,
  fileName: string,
  contentHash: string,
): boolean {
  if (!oldEntry) return false;

  if (oldEntry.hash) {
    return oldEntry.hash !== contentHash;
  }

  return false;
}
