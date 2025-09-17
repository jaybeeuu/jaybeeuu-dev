import type { Result } from "@jaybeeuu/utilities";
import { failure, success } from "@jaybeeuu/utilities";
import { canAccess, readJsonFile, readTextFile } from "../files/index.js";
import type { ReadJsonFileFailureReason } from "../files/index.js";
import type {
  ParseYamlMetaFailureReason,
  PostMetaFileData,
} from "./metadata.js";
import { isPostMetaFile, parseYamlMeta } from "./metadata.js";

export type LoadSourceFailureReason = "load source failure";
export type NoFrontMatterFailureReason = "no frontmatter in markdown file";
export type JsonFileNotFoundReason = "json file not found";
export type UnsupportedFileExtensionReason = "unsupported file extension";

export type ResolveFrontMatterPostFailureReason =
  | LoadSourceFailureReason
  | NoFrontMatterFailureReason
  | ParseYamlMetaFailureReason;

export type ResolveJsonPostFailureReason =
  | LoadSourceFailureReason
  | JsonFileNotFoundReason
  | ReadJsonFileFailureReason;

export type ResolvePostFailureReason =
  | ResolveFrontMatterPostFailureReason
  | ResolveJsonPostFailureReason
  | UnsupportedFileExtensionReason;

export interface PostData {
  content: string;
  metadata: PostMetaFileData;
}

const loadPostSourceText = async (
  sourceFilePath: string,
): Promise<Result<string, LoadSourceFailureReason>> => {
  try {
    const postText = await readTextFile(sourceFilePath);

    return success(postText);
  } catch (error) {
    return failure("load source failure", error);
  }
};

const hasFrontMatter = (sourceFileText: string): boolean => {
  return (
    sourceFileText.startsWith("---\n") &&
    sourceFileText.indexOf("\n---\n", 4) !== -1
  );
};

const resolveFrontmatterPost = async (
  markdownFilePath: string,
): Promise<Result<PostData, ResolveFrontMatterPostFailureReason>> => {
  const sourceFileTextResult = await loadPostSourceText(markdownFilePath);
  if (!sourceFileTextResult.success) {
    return sourceFileTextResult;
  }

  const sourceFileText = sourceFileTextResult.value;

  if (!hasFrontMatter(sourceFileText)) {
    return failure(
      "no frontmatter in markdown file",
      new Error(`No frontmatter in markdown file: ${markdownFilePath}`),
    );
  }

  const frontMatterEnd = sourceFileText.indexOf("\n---\n", 4);
  const frontMatterText = sourceFileText.slice(4, frontMatterEnd);
  const content = sourceFileText.slice(frontMatterEnd + 5);

  const yamlResult = parseYamlMeta(frontMatterText);
  if (!yamlResult.success) {
    return yamlResult;
  }

  return success({
    content,
    metadata: yamlResult.value,
  });
};

const resolveJsonPost = async (
  markdownFilePath: string,
): Promise<Result<PostData, ResolveJsonPostFailureReason>> => {
  const sourceFileTextResult = await loadPostSourceText(markdownFilePath);
  if (!sourceFileTextResult.success) {
    return sourceFileTextResult;
  }

  const jsonFilePath = markdownFilePath.replace(/\.md$/, ".post.json");

  const canAccessJson = await canAccess(jsonFilePath);
  if (!canAccessJson) {
    return failure(
      "json file not found",
      new Error(`Corresponding .post.json file not found: ${jsonFilePath}`),
    );
  }

  const metadataResult = await readJsonFile(jsonFilePath, isPostMetaFile);
  if (!metadataResult.success) {
    return metadataResult;
  }

  return success({
    content: sourceFileTextResult.value,
    metadata: metadataResult.value,
  });
};

export const resolvePost = async (
  markdownFilePath: string,
): Promise<Result<PostData, ResolvePostFailureReason>> => {
  if (markdownFilePath.endsWith(".post.md")) {
    return resolveFrontmatterPost(markdownFilePath);
  } else if (markdownFilePath.endsWith(".md")) {
    return resolveJsonPost(markdownFilePath);
  } else {
    return failure(
      "unsupported file extension",
      new Error(`Unsupported file extension: ${markdownFilePath}`),
    );
  }
};
