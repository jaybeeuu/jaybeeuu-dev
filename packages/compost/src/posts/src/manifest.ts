import type { Failure, Result } from "@jaybeeuu/utilities";
import { failure, is, isObject, isRecordOf, or } from "@jaybeeuu/utilities";
import type { FetchJsonFileFailureReason, ReadJsonFileFailureReason } from "../../files/index.js";
import { fetchJsonFile, readJsonFile } from "../../files/index.js";
import type { PostManifest, PostMetaData } from "./types.js";

const isPostMetaData = isObject<PostMetaData>({
  abstract: is("string"),
  fileName: is("string"),
  href: is("string"),
  lastUpdateDate: or(is("string"), is("null")),
  publish: is("boolean"),
  publishDate: is("string"),
  slug: is("string"),
  title: is("string")
});

const isManifestFile = isRecordOf<PostManifest>(isPostMetaData);

export type GetManifestFailure = "read manifest failed";

const getManifestFromOldManifestLocator = async (
  manifestLocator: string
): Promise<Result<PostManifest, FetchJsonFileFailureReason | ReadJsonFileFailureReason>> => {
  const readResult = (/^https?/).test(manifestLocator)
    ? await fetchJsonFile(manifestLocator, isManifestFile)
    : await readJsonFile(manifestLocator, isManifestFile);

  if (readResult.success) {
    return readResult;
  }

  return readResult;
};

export const getManifest = async (
  manifestOutputFileName: string,
  manifestLocators: string[]
): Promise<Result<PostManifest, GetManifestFailure>> => {
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
