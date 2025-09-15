import type { Result } from "@jaybeeuu/utilities";
import { failure, success } from "@jaybeeuu/utilities";
import yaml from "js-yaml";
import { isPostMetaFile, type PostMetaFileData } from "./metafile.js";

export type NoFrontMatterFoundReason = "no front matter found";
export type FrontMatterNotClosedReason = "front matter not properly closed";
export type InvalidFrontMatterStructureReason =
  "invalid front matter structure";
export type FrontMatterYamlParseFailureReason =
  "front matter yaml parse failure";

export type ParseFrontMatterFailureReason =
  | NoFrontMatterFoundReason
  | FrontMatterNotClosedReason
  | InvalidFrontMatterStructureReason
  | FrontMatterYamlParseFailureReason;

export interface FrontMatterResult {
  metadata: PostMetaFileData;
  content: string;
}

const loadYaml = (
  yamlText: string,
): Result<unknown, FrontMatterYamlParseFailureReason> => {
  try {
    const parsedYaml = yaml.load(yamlText);
    return success(parsedYaml);
  } catch (error) {
    return failure("front matter yaml parse failure", error);
  }
};

export const parseFrontMatter = (
  fileContent: string,
): Result<FrontMatterResult, ParseFrontMatterFailureReason> => {
  if (!fileContent.startsWith("---\n")) {
    return failure("no front matter found", new Error("No front matter found"));
  }

  const frontMatterEnd = fileContent.indexOf("\n---\n", 4);
  if (frontMatterEnd === -1) {
    return failure(
      "front matter not properly closed",
      new Error("Front matter not properly closed"),
    );
  }

  const frontMatterText = fileContent.slice(4, frontMatterEnd);
  const markdownContent = fileContent.slice(frontMatterEnd + 5);

  const yamlResult = loadYaml(frontMatterText);
  if (!yamlResult.success) {
    return yamlResult;
  }

  const parsedYaml = yamlResult.value;

  if (!isPostMetaFile(parsedYaml)) {
    return failure(
      "invalid front matter structure",
      new Error("Invalid front matter structure"),
    );
  }

  return success({
    metadata: parsedYaml,
    content: markdownContent,
  });
};

export const hasFrontMatter = (fileContent: string): boolean => {
  return (
    fileContent.startsWith("---\n") && fileContent.indexOf("\n---\n", 4) !== -1
  );
};
