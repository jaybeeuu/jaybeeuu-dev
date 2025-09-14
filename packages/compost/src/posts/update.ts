import type { Result } from "@jaybeeuu/utilities";
import { failure, joinUrlPath, log, success } from "@jaybeeuu/utilities";
import path from "path";
import {
  canAccess,
  copyFile,
  deleteDirectories,
  readTextFile,
  recurseDirectory,
  writeJsonFile,
  writeTextFile,
} from "../files/index.js";
import type { CompileFailureReason as CompileFailureReason } from "./compile.js";
import { compilePost } from "./compile.js";
import type { ValidateSlugFailureReason as ValidateSlugFailureReason } from "./file-paths.js";
import {
  getCompiledPostFileName,
  getSlug,
  validateSlug,
} from "./file-paths.js";
import type { GetOldManifestFailureReason } from "./manifest.js";
import { getOldManifest } from "./manifest.js";
import type {
  GetMetaFileContentFailureReason,
  PostMetaFileData,
} from "./metafile.js";
import { isPostMetaFile } from "./metafile.js";
import type { ParesFrontMatterFailed } from "./frontmatter.js";
import { hasFrontMatter, parseFrontMatter } from "./frontmatter.js";
import type { OldPostManifest, PostManifest, UpdateOptions } from "./types.js";
import getReadingTime from "reading-time";

export type UpdateFailureReason =
  | CompileFailureReason
  | ValidateSlugFailureReason
  | GetOldManifestFailureReason
  | ResolvePostFailureReason;

export type LoadSourceFailureReason = `Failed to load file ${string}`;

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

type ResolvePostFailureReason =
  | LoadSourceFailureReason
  | GetMetaFileContentFailureReason
  | ParesFrontMatterFailed;

interface PostData {
  content: string;
  meta: PostMetaFileData;
}

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

const resolvePost = async (
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

const processPost = async ({
  slug,
  metaData,
  sourceFileText,
  sourceFilePath,
  options,
  oldManifest,
  resolvedOutputDir,
}: {
  slug: string;
  metaData: PostMetaFileData;
  sourceFileText: string;
  sourceFilePath: string;
  options: UpdateOptions;
  oldManifest: OldPostManifest;
  resolvedOutputDir: string;
}): Promise<Result<PostManifest[string], UpdateFailureReason>> => {
  const compiledPostResult = await compilePost({
    codeLineNumbers: options.codeLineNumbers,
    hrefRoot: options.hrefRoot,
    removeH1: options.removeH1,
    sourceFilePath,
    sourceFileText,
  });

  if (!compiledPostResult.success) {
    return compiledPostResult;
  }

  const { html: compiledPost, assets } = compiledPostResult.value;
  const compiledFileName = getCompiledPostFileName(slug, compiledPost);
  const compiledFilePath = path.join(resolvedOutputDir, compiledFileName);

  await Promise.all([
    writeTextFile(compiledFilePath, compiledPost),
    ...assets.map((asset) =>
      copyFile(
        asset.sourcePath,
        path.join(options.outputDir, asset.destinationPath),
      ),
    ),
  ]);

  const href = joinUrlPath(options.hrefRoot, compiledFileName);
  const originalRecord = oldManifest[slug];

  const publishDate = new Date(
    originalRecord?.publishDate ?? new Date(),
  ).toISOString();

  const hasBeenUpdated =
    originalRecord && originalRecord.fileName !== compiledFileName;
  const lastUpdateDate = hasBeenUpdated
    ? new Date().toISOString()
    : originalRecord?.lastUpdateDate
      ? new Date(originalRecord.lastUpdateDate).toISOString()
      : null;

  const readingTime = getReadingTime(sourceFileText);

  return success({
    ...metaData,
    fileName: compiledFileName,
    href,
    lastUpdateDate,
    publishDate,
    readingTime,
    slug,
  });
};

export const update = async (
  options: UpdateOptions,
): Promise<Result<PostManifest, UpdateFailureReason>> => {
  const oldManifestReadResult = await getOldManifest(
    path.join(options.outputDir, options.manifestFileName),
    options.oldManifestLocators,
  );
  if (!oldManifestReadResult.success) {
    if (options.requireOldManifest) {
      return oldManifestReadResult;
    } else {
      log.warn(`Could not find old manifest: ${oldManifestReadResult.message}`);
    }
  }

  const oldManifest: OldPostManifest = oldManifestReadResult.success
    ? oldManifestReadResult.value
    : {};
  const newManifest: PostManifest = {};
  const resolvedOutputDir = path.resolve(options.outputDir);
  const resolvedSourceDir = path.resolve(options.sourceDir);

  await deleteDirectories(resolvedOutputDir);

  // Process all markdown files (both .md and .post.md)
  for await (const markdownFileInfo of recurseDirectory(resolvedSourceDir, {
    include: [/\.md$/, /\.post\.md$/],
  })) {
    const slug = getSlug(markdownFileInfo.relativeFilePath);

    const slugValidation = validateSlug(slug);
    if (!slugValidation.success) {
      return slugValidation;
    }

    const postDataResult = await resolvePost(markdownFileInfo.filePath);
    if (!postDataResult.success) {
      // For .post.md files, differentiate between missing front matter (skip) vs parsing errors (fail)
      if (markdownFileInfo.filePath.endsWith(".post.md")) {
        // Check if the error is due to missing front matter (should skip) vs parsing errors (should fail)
        const errorDetails =
          (postDataResult.messageOrError as Error).message || "";
        if (errorDetails.includes("No front matter found")) {
          // Skip files without front matter
          continue;
        } else {
          // Fail compilation for actual parsing errors (invalid YAML, invalid structure, etc.)
          return postDataResult;
        }
      }
      // Skip .md files that can't be resolved (e.g., no corresponding .post.json)
      continue;
    }

    const { content, meta: metaData } = postDataResult.value;

    if (!metaData.publish && !options.includeUnpublished) {
      continue;
    }

    const result = await processPost({
      slug,
      metaData,
      sourceFileText: content,
      sourceFilePath: markdownFileInfo.filePath,
      options,
      oldManifest,
      resolvedOutputDir,
    });

    if (!result.success) {
      return result;
    }

    newManifest[slug] = result.value;
  }

  await writeJsonFile(
    path.resolve(options.outputDir, options.manifestFileName),
    newManifest,
  );

  return success(newManifest);
};
