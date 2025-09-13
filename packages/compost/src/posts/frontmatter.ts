import { is, isObject } from "@jaybeeuu/is";
import type { Result } from "@jaybeeuu/utilities";
import { failure, success } from "@jaybeeuu/utilities";
import yaml from "js-yaml";
import type { PostMetaFileData } from "./metafile.js";

const isPostMetaFile = isObject<PostMetaFileData>({
  abstract: is("string"),
  publish: is("boolean"),
  title: is("string"),
});

export interface FrontMatterResult {
  metadata: PostMetaFileData;
  content: string;
}

export const parseFrontMatter = (
  fileContent: string,
): Result<FrontMatterResult, "parse front matter failed"> => {
  if (!fileContent.startsWith("---\n")) {
    return failure(
      "parse front matter failed",
      new Error("No front matter found"),
    );
  }

  const frontMatterEnd = fileContent.indexOf("\n---\n", 4);
  if (frontMatterEnd === -1) {
    return failure(
      "parse front matter failed",
      new Error("Front matter not properly closed"),
    );
  }

  try {
    // Extract front matter content (skip opening ---)
    const frontMatterText = fileContent.slice(4, frontMatterEnd);

    // Extract markdown content (skip closing --- and newline)
    const markdownContent = fileContent.slice(frontMatterEnd + 5);

    // Parse YAML front matter
    const parsedYaml = yaml.load(frontMatterText);

    // Validate against PostMetaFileData schema
    if (!isPostMetaFile(parsedYaml)) {
      return failure(
        "parse front matter failed",
        new Error("Invalid front matter structure"),
      );
    }

    return success({
      metadata: parsedYaml,
      content: markdownContent,
    });
  } catch (error) {
    return failure("parse front matter failed", error);
  }
};

export const hasFrontMatter = (fileContent: string): boolean => {
  return (
    fileContent.startsWith("---\n") && fileContent.indexOf("\n---\n", 4) !== -1
  );
};
