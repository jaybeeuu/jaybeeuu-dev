import { is, isObject, isRecord, or } from "@bickley-wallace/utilities";
import { PostManifest, PostMetaData } from "./types";
import { readJsonFile } from "../../files";
import { Result, repackError, success } from "../../results";

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
  manifestFilePath: string
): Promise<Result<PostManifest, GetManifestFailure>> => {
  const readResult = await readJsonFile(manifestFilePath, isManifestFile);
  if (readResult.success) {
    return readResult;
  }

  if (readResult.reason === "no access") {
    return success({});
  }

  return repackError(
    readResult,
    "read manifest failed",
    `Reading manifest file ${manifestFilePath} failed.`
  );
};
