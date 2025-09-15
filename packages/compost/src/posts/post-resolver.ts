import type { Result } from "@jaybeeuu/utilities";
import { failure, success } from "@jaybeeuu/utilities";
import { canAccess, readTextFile } from "../files/index.js";
import type { PostMetaFileData } from "./metafile.js";
import { isPostMetaFile } from "./metafile.js";
import type { ParseFrontMatterFailureReason } from "./frontmatter.js";
import { hasFrontMatter, parseFrontMatter } from "./frontmatter.js";

export type LoadSourceFailureReason = "load source failure";
export type NoFrontMatterFailureReason = "no frontmatter in markdown file";
export type JsonFileNotFoundReason = "json file not found";
export type LoadJsonFileFailureReason = "load json file failure";
export type JsonParseFailureReason = "json parse failure";
export type JsonValidationFailureReason = "json validation failure";
export type UnsupportedFileExtensionReason = "unsupported file extension";

export type ResolveFrontMatterPostFailureReason =
  | LoadSourceFailureReason
  | NoFrontMatterFailureReason
  | ParseFrontMatterFailureReason;

export type ResolveJsonPostFailureReason =
  | LoadSourceFailureReason
  | JsonFileNotFoundReason
  | LoadJsonFileFailureReason
  | JsonParseFailureReason
  | JsonValidationFailureReason;

type ResolvePostFailureReason =
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

const loadJsonFileText = async (
  jsonFilePath: string,
): Promise<Result<string, LoadJsonFileFailureReason>> => {
  try {
    const jsonText = await readTextFile(jsonFilePath);
    return success(jsonText);
  } catch (error) {
    return failure("load json file failure", error);
  }
};

const parseJsonContent = (
  jsonText: string,
): Result<unknown, JsonParseFailureReason> => {
  try {
    const parsed = JSON.parse(jsonText) as unknown;
    return success(parsed);
  } catch (error) {
    return failure("json parse failure", error);
  }
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

  const frontMatterResult = parseFrontMatter(sourceFileText);
  if (!frontMatterResult.success) {
    return frontMatterResult;
  }

  const { metadata, content } = frontMatterResult.value;

  return success({
    content,
    metadata,
  });
};

const resolveJsonPost = async (
  markdownFilePath: string,
): Promise<Result<PostData, ResolveJsonPostFailureReason>> => {
  const sourceFileTextResult = await loadPostSourceText(markdownFilePath);
  if (!sourceFileTextResult.success) {
    return sourceFileTextResult;
  }

  // Convert .md path to .post.json path
  const jsonFilePath = markdownFilePath.replace(/\.md$/, ".post.json");

  // Check if the JSON file exists
  const canAccessJson = await canAccess(jsonFilePath);
  if (!canAccessJson) {
    return failure(
      "json file not found",
      new Error(`Corresponding .post.json file not found: ${jsonFilePath}`),
    );
  }

  // Load the JSON file content
  const jsonContentResult = await loadJsonFileText(jsonFilePath);
  if (!jsonContentResult.success) {
    return jsonContentResult;
  }

  // Parse the JSON content
  const parseResult = parseJsonContent(jsonContentResult.value);
  if (!parseResult.success) {
    return parseResult;
  }

  // Validate the metadata structure
  const metadata = parseResult.value;
  if (!isPostMetaFile(metadata)) {
    return failure(
      "json validation failure",
      new Error(`Invalid metadata structure in JSON file: ${jsonFilePath}`),
    );
  }

  return success({
    content: sourceFileTextResult.value,
    metadata,
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

export type { ResolvePostFailureReason };
