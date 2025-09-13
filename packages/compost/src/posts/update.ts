import type { Result } from "@jaybeeuu/utilities";
import { failure, joinUrlPath, log, success } from "@jaybeeuu/utilities";
import path from "path";
import {
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
  getPostMarkdownFilePath,
  getSlug,
  validateSlug,
} from "./file-paths.js";
import type { GetOldManifestFailureReason } from "./manifest.js";
import { getOldManifest } from "./manifest.js";
import type {
  GetMetaFileContentFailureReason,
  PostMetaFileData,
} from "./metafile.js";
import { getMetaFileContent } from "./metafile.js";
import {
  hasFrontMatter,
  parseFrontMatter,
  type PARSE_FRONT_MATTER_FAILED,
} from "./frontmatter.js";
import type { OldPostManifest, PostManifest, UpdateOptions } from "./types.js";
import getReadingTime from "reading-time";

export type UpdateFailureReason =
  | CompileFailureReason
  | ValidateSlugFailureReason
  | GetOldManifestFailureReason
  | GetMetaFileContentFailureReason
  | LoadSourceFailureReason
  | typeof PARSE_FRONT_MATTER_FAILED;

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

  // Collect all posts from both JSON files and front matter markdown files
  const processedSlugs = new Set<string>();

  // Process traditional JSON metadata files
  for await (const metadataFileInfo of recurseDirectory(resolvedSourceDir, {
    include: [/.post.json$/],
  })) {
    const slug = getSlug(metadataFileInfo.relativeFilePath);
    processedSlugs.add(slug);

    const slugValidation = validateSlug(slug);
    if (!slugValidation.success) {
      return slugValidation;
    }

    const metaFileContentResult = await getMetaFileContent(metadataFileInfo);
    if (!metaFileContentResult.success) {
      return metaFileContentResult;
    }

    const metaData = metaFileContentResult.value;
    if (!metaData.publish && !options.includeUnpublished) {
      continue;
    }

    const postMarkdownFilePath = getPostMarkdownFilePath(
      metadataFileInfo.absolutePath,
      slug,
    );

    const sourceFileText = await loadPostSourceText(postMarkdownFilePath);
    if (!sourceFileText.success) {
      return sourceFileText;
    }

    const result = await processPost({
      slug,
      metaData,
      sourceFileText: sourceFileText.value,
      sourceFilePath: postMarkdownFilePath,
      options,
      oldManifest,
      resolvedOutputDir,
    });

    if (!result.success) {
      return result;
    }

    newManifest[slug] = result.value;
  }

  // Process markdown files with front matter (skip already processed ones)
  for await (const markdownFileInfo of recurseDirectory(resolvedSourceDir, {
    include: [/\.md$/],
  })) {
    const slug = getSlug(markdownFileInfo.relativeFilePath);

    // Skip if already processed via JSON file
    if (processedSlugs.has(slug)) {
      continue;
    }

    const slugValidation = validateSlug(slug);
    if (!slugValidation.success) {
      return slugValidation;
    }

    const sourceFileText = await loadPostSourceText(markdownFileInfo.filePath);
    if (!sourceFileText.success) {
      return sourceFileText;
    }

    // Check if this markdown file has front matter
    if (!hasFrontMatter(sourceFileText.value)) {
      continue;
    }

    const frontMatterResult = parseFrontMatter(sourceFileText.value);
    if (!frontMatterResult.success) {
      return frontMatterResult;
    }

    const { metadata: metaData, content: markdownContent } =
      frontMatterResult.value;

    if (!metaData.publish && !options.includeUnpublished) {
      continue;
    }

    const result = await processPost({
      slug,
      metaData,
      sourceFileText: markdownContent,
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
