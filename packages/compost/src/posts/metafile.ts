import { is, isObject } from "@jaybeeuu/is";
import type { Result } from "@jaybeeuu/utilities";
import { failure, repackError, success } from "@jaybeeuu/utilities";
import yaml from "js-yaml";
import type { FileInfo } from "../files/index.js";
import { readJsonFile, readTextFile } from "../files/index.js";
import type { PostMetaData } from "./types.js";

export type PostMetaFileData = Pick<
  PostMetaData,
  "abstract" | "title" | "publish"
>;

export const isPostMetaFile = isObject<PostMetaFileData>({
  abstract: is("string"),
  publish: is("boolean"),
  title: is("string"),
});

export type GetMetaFileContentFailureReason = "read metadata failed";
export type ReadYamlMetaFileFailureReason =
  | "load yaml file failure"
  | "yaml parse failure"
  | "yaml validation failure";

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

export const readYamlMetaFile = async (
  filePath: string,
): Promise<Result<PostMetaFileData, ReadYamlMetaFileFailureReason>> => {
  // Read the YAML file content
  let fileContent: string;
  try {
    fileContent = await readTextFile(filePath);
  } catch (error) {
    return failure("load yaml file failure", error);
  }

  // Parse the YAML content
  let parsedContent: unknown;
  try {
    parsedContent = yaml.load(fileContent);
  } catch (error) {
    return failure("yaml parse failure", error);
  }

  // Validate the metadata structure
  if (!isPostMetaFile(parsedContent)) {
    return failure(
      "yaml validation failure",
      new Error(`Invalid metadata structure in YAML file: ${filePath}`),
    );
  }

  return success(parsedContent);
};
