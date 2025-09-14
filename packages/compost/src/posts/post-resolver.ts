import type { Result } from "@jaybeeuu/utilities";
import { failure, success } from "@jaybeeuu/utilities";
import { canAccess, readTextFile } from "../files/index.js";
import type {
  GetMetaFileContentFailureReason,
  PostMetaFileData,
} from "./metafile.js";
import { isPostMetaFile } from "./metafile.js";
import type { ParesFrontMatterFailed } from "./frontmatter.js";
import { hasFrontMatter, parseFrontMatter } from "./frontmatter.js";

export type LoadSourceFailureReason = `Failed to load file ${string}`;

type ResolvePostFailureReason =
  | LoadSourceFailureReason
  | GetMetaFileContentFailureReason
  | ParesFrontMatterFailed;

export interface PostData {
  content: string;
  meta: PostMetaFileData;
}

const loadPostSourceText = async (
  sourceFilePath: string,
): Promise<Result<string, LoadSourceFailureReason>> => {
  try {
    const postText = await readTextFile(sourceFilePath);

    return success(postText);
  } catch (error) {
    return failure(`Failed to load file ${sourceFilePath}`, error);
  }
};

const resolveFrontmatterPost = async (
  markdownFilePath: string,
): Promise<Result<PostData, ResolvePostFailureReason>> => {
  const sourceFileTextResult = await loadPostSourceText(markdownFilePath);
  if (!sourceFileTextResult.success) {
    return sourceFileTextResult;
  }

  const sourceFileText = sourceFileTextResult.value;

  if (!hasFrontMatter(sourceFileText)) {
    const failureReason: LoadSourceFailureReason = `Failed to load file ${markdownFilePath}`;
    return failure(
      failureReason,
      new Error("No front matter found in .post.md file"),
    );
  }

  const frontMatterResult = parseFrontMatter(sourceFileText);
  if (!frontMatterResult.success) {
    return frontMatterResult;
  }

  const { metadata, content } = frontMatterResult.value;

  return success({
    content,
    meta: metadata,
  });
};

const resolveJsonPost = async (
  markdownFilePath: string,
): Promise<Result<PostData, ResolvePostFailureReason>> => {
  const sourceFileTextResult = await loadPostSourceText(markdownFilePath);
  if (!sourceFileTextResult.success) {
    return sourceFileTextResult;
  }

  // Convert .md path to .post.json path
  const jsonFilePath = markdownFilePath.replace(/\.md$/, ".post.json");

  // Check if the JSON file exists
  const canAccessJson = await canAccess(jsonFilePath);
  if (!canAccessJson) {
    const failureReason: LoadSourceFailureReason = `Failed to load file ${jsonFilePath}`;
    return failure(
      failureReason,
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
        new Error("Invalid metadata structure in JSON file"),
      );
    }

    return success({
      content: sourceFileTextResult.value,
      meta: metadata,
    });
  } catch (error) {
    const failureReason: LoadSourceFailureReason = `Failed to load file ${jsonFilePath}`;
    return failure(
      failureReason,
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
    const failureReason: LoadSourceFailureReason = `Failed to load file ${markdownFilePath}`;
    return failure(
      failureReason,
      new Error(`Unsupported file extension: ${markdownFilePath}`),
    );
  }
};

export type { ResolvePostFailureReason };
