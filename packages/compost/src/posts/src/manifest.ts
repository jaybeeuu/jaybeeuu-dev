import { is, isObject, isRecord, or } from "@jaybeeuu/utilities";
import type { PostManifest, PostMetaData } from "./types.js";
import { fetchJsonFile, readJsonFile } from "../../files/index.js";
import type { Result } from "../../results.js";
import { repackError } from "../../results.js";

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

const isManifestFile = isRecord<PostManifest>(isPostMetaData);

export type GetManifestFailure = "read manifest failed";

export const getManifest = async (
  manifestOutputFileName: string,
  manifestLocator?: string
): Promise<Result<PostManifest, GetManifestFailure>> => {
  const defaultedManifestLocator = manifestLocator ?? manifestOutputFileName;

  const readResult = (/^https?/).test(defaultedManifestLocator)
    ? await fetchJsonFile(defaultedManifestLocator, isManifestFile)
    : await readJsonFile(defaultedManifestLocator, isManifestFile);

  if (readResult.success) {
    return readResult;
  }

  return repackError(
    readResult,
    "read manifest failed",
    `Reading manifest file ${defaultedManifestLocator} failed.`
  );
};
