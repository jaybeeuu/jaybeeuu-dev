import type { Result } from "@jaybeeuu/utilities";
import { failure, success } from "@jaybeeuu/utilities";
import { canAccess, readTextFile } from "../files/index.js";
import type { PostMetaFileData } from "./metafile.js";
import { isPostMetaFile } from "./metafile.js";
import type { ParesFrontMatterFailed } from "./frontmatter.js";
import { hasFrontMatter, parseFrontMatter } from "./frontmatter.js";

export type LoadSourceFailureReason = "load source failure";
export type NoFrontMatterFailureReason = "no frontmatter in markdown file";
export type JsonFileNotFoundReason = "json file not found";
export type JsonParseFailureReason = "json parse failure";
export type UnsupportedFileExtensionReason = "unsupported file extension";

export type ResolveFrontMatterPostFailureReason =
  | LoadSourceFailureReason
  | NoFrontMatterFailureReason
  | ParesFrontMatterFailed;

export type ResolveJsonPostFailureReason =
  | LoadSourceFailureReason
  | JsonFileNotFoundReason
  | JsonParseFailureReason
  | ParesFrontMatterFailed;

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

  // Read and parse the JSON metadata
  try {
    const jsonContent = await readTextFile(jsonFilePath);
    const metadata: unknown = JSON.parse(jsonContent);

    // Validate the metadata structure (similar to getMetaFileContent)
    if (!isPostMetaFile(metadata)) {
      const failureReason: ParesFrontMatterFailed = "parse front matter failed";
      return failure(
        failureReason,
        new Error(`Invalid metadata structure in JSON file: ${jsonFilePath}`),
      );
    }

    return success({
      content: sourceFileTextResult.value,
      metadata,
    });
  } catch (error) {
    return failure(
      "json parse failure",
      new Error(
        `Failed to read or parse JSON file: ${jsonFilePath}. Error: ${String(error)}`,
      ),
    );
  }
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
