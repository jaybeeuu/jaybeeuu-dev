import type { Failure, Result } from "@jaybeeuu/utilities";
import { failure, is, isObject, isRecordOf, or } from "@jaybeeuu/utilities";
import type { FetchJsonFileFailureReason, ReadJsonFileFailureReason } from "../../files/index.js";
import { fetchJsonFile, readJsonFile } from "../../files/index.js";
import type { OldPostManifest, OldPostMetaData } from "./types.js";

const isOldPostMetaData = isObject<OldPostMetaData>({
  fileName: is("string"),
  lastUpdateDate: or(is("string"), is("null")),
  publishDate: is("string")
});

const isOldManifest = isRecordOf<OldPostManifest>(isOldPostMetaData);

export type GetOldManifestFailureReason = "read manifest failed";

const getManifestFromOldManifestLocator = async (
  manifestLocator: string
): Promise<Result<OldPostManifest, FetchJsonFileFailureReason | ReadJsonFileFailureReason>> => {
  const readResult = (/^https?/).test(manifestLocator)
    ? await fetchJsonFile(manifestLocator, isOldManifest)
    : await readJsonFile(manifestLocator, isOldManifest);

  if (readResult.success) {
    return readResult;
  }

  return readResult;
};

export const getOldManifest = async (
  manifestOutputFileName: string,
  manifestLocators: string[]
): Promise<Result<OldPostManifest, GetOldManifestFailureReason>> => {
  const defaultedManifestLocators = [...manifestLocators, manifestOutputFileName];
  const failures: Failure<FetchJsonFileFailureReason | ReadJsonFileFailureReason>[] = [];

  for (const manifestLocator of defaultedManifestLocators) {
    const result = await getManifestFromOldManifestLocator(manifestLocator);
    if (result.success) {
      return result;
    }

    failures.push(result);
  }

  return failure("read manifest failed", failures.map((fail) => fail.stack ?? fail.message).join("\n"));
};
