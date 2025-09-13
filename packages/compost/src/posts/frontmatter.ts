import type { Result } from "@jaybeeuu/utilities";
import { failure, success } from "@jaybeeuu/utilities";
import yaml from "js-yaml";
import { isPostMetaFile, type PostMetaFileData } from "./metafile.js";

export const PARSE_FRONT_MATTER_FAILED = "parse front matter failed" as const;

export interface FrontMatterResult {
  metadata: PostMetaFileData;
  content: string;
}

export const parseFrontMatter = (
  fileContent: string,
): Result<FrontMatterResult, "parse front matter failed"> => {
  if (!fileContent.startsWith("---\n")) {
    return failure(
      PARSE_FRONT_MATTER_FAILED,
      new Error("No front matter found"),
    );
  }

  const frontMatterEnd = fileContent.indexOf("\n---\n", 4);
  if (frontMatterEnd === -1) {
    return failure(
      PARSE_FRONT_MATTER_FAILED,
      new Error("Front matter not properly closed"),
    );
  }

  try {
    const frontMatterText = fileContent.slice(4, frontMatterEnd);
    const markdownContent = fileContent.slice(frontMatterEnd + 5);
    const parsedYaml = yaml.load(frontMatterText);

    if (!isPostMetaFile(parsedYaml)) {
      return failure(
        PARSE_FRONT_MATTER_FAILED,
        new Error("Invalid front matter structure"),
      );
    }

    return success({
      metadata: parsedYaml,
      content: markdownContent,
    });
  } catch (error) {
    return failure(PARSE_FRONT_MATTER_FAILED, error);
  }
};

export const hasFrontMatter = (fileContent: string): boolean => {
  return (
    fileContent.startsWith("---\n") && fileContent.indexOf("\n---\n", 4) !== -1
  );
};
