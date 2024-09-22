import { is, isObject } from "@jaybeeuu/is";
import type { Result } from "@jaybeeuu/utilities";
import { repackError } from "@jaybeeuu/utilities";
import type { FileInfo } from "../files/index.js";
import { readJsonFile } from "../files/index.js";
import type { PostMetaData } from "./types.js";

export type PostMetaFileData = Pick<
  PostMetaData,
  "abstract" | "title" | "publish"
>;

const isPostMetaFile = isObject<PostMetaFileData>({
  abstract: is("string"),
  publish: is("boolean"),
  title: is("string"),
});

export type GetMetaFileContentFailureReason = "read metadata failed";

export const getMetaFileContent = async (
  metaFileInfo: FileInfo,
): Promise<Result<PostMetaFileData, "read metadata failed">> => {
  const { relativeFilePath, filePath } = metaFileInfo;

  return repackError(
    await readJsonFile(filePath, isPostMetaFile),
    "read metadata failed",
    `Reading metadata file ${relativeFilePath} failed.`,
  );
};
