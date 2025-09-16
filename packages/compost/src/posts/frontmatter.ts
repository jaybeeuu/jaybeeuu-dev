import type { Result } from "@jaybeeuu/utilities";
import { failure, success } from "@jaybeeuu/utilities";
import type { ParseYamlMetaFailureReason } from "./metafile.js";
import { parseYamlMeta, type PostMetaFileData } from "./metafile.js";

export type NoFrontMatterFoundReason = "no front matter found";
export type FrontMatterNotClosedReason = "front matter not properly closed";
export type InvalidFrontMatterStructureReason =
  "invalid front matter structure";

export type ParseFrontMatterFailureReason =
  | NoFrontMatterFoundReason
  | FrontMatterNotClosedReason
  | InvalidFrontMatterStructureReason
  | ParseYamlMetaFailureReason;

export interface FrontMatterResult {
  metadata: PostMetaFileData;
  content: string;
}

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

  const yamlResult = parseYamlMeta(frontMatterText);
  if (!yamlResult.success) {
    return yamlResult;
  }

  return success({
    metadata: yamlResult.value,
    content: markdownContent,
  });
};

export const hasFrontMatter = (fileContent: string): boolean => {
  return (
    fileContent.startsWith("---\n") && fileContent.indexOf("\n---\n", 4) !== -1
  );
};
