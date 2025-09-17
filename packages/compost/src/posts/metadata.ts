import { is, isObject } from "@jaybeeuu/is";
import type { Result } from "@jaybeeuu/utilities";
import { failure, success } from "@jaybeeuu/utilities";
import yaml from "js-yaml";
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

export type LoadYamlFailureReason = "front matter yaml parse failure";

const loadYaml = (yamlText: string): Result<unknown, LoadYamlFailureReason> => {
  try {
    const parsedYaml = yaml.load(yamlText);
    return success(parsedYaml);
  } catch (error) {
    return failure("front matter yaml parse failure", error);
  }
};

export type ParseYamlMetaFailureReason =
  | LoadYamlFailureReason
  | "yaml metadata invalid";

export const parseYamlMeta = (
  yamlMeta: string,
): Result<PostMetaFileData, ParseYamlMetaFailureReason> => {
  const yamlResult = loadYaml(yamlMeta);
  if (!yamlResult.success) {
    return yamlResult;
  }

  const parsedYaml = yamlResult.value;
  const validationResult = isPostMetaFile.validate(parsedYaml);

  if (validationResult.valid) {
    return success(parsedYaml as PostMetaFileData);
  }

  return failure(
    "yaml metadata invalid",
    validationResult.errorMessages.join("; "),
  );
};
