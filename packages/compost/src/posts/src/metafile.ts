import { is, isObject } from "@bickley-wallace/utilities";
import { PostMetaData } from "./types";
import { FileInfo, readJsonFile } from "../../files";
import { Result, repackError } from "../../results";

export type PostMetaFileData = Pick<PostMetaData, "abstract" | "title" | "publish">;

const isPostMetaFile = isObject<PostMetaFileData>({
  abstract: is("string"),
  publish: is("boolean"),
  title: is("string")
});

export type GetMetaFileContentFailure = "read metadata failed";

export const getMetaFileContent = async (
  metaFileInfo: FileInfo
): Promise<Result<PostMetaFileData, "read metadata failed">> => {
  const { relativeFilePath, filePath } = metaFileInfo;
  return repackError(
    await readJsonFile(filePath, isPostMetaFile),
    "read metadata failed",
    `Reading metadata file ${relativeFilePath} failed.`
  );
};
