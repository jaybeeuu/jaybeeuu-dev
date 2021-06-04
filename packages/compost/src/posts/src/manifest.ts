import { is, isObject, isRecord, or } from "@bickley-wallace/utilities";
import type { PostManifest, PostMetaData } from "./types.js";
import { readJsonFile } from "../../files/index.js";
import type { Result} from "../../results.js";
import { repackError, success } from "../../results.js";

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
