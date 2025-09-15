import type { Result } from "@jaybeeuu/utilities";
import { joinUrlPath, log, success } from "@jaybeeuu/utilities";
import path from "path";
import {
  copyFile,
  deleteDirectories,
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
import type { PostMetaFileData } from "./metafile.js";
import type { OldPostManifest, PostManifest, UpdateOptions } from "./types.js";
import type { ResolvePostFailureReason } from "./post-resolver.js";
import { resolvePost } from "./post-resolver.js";
import getReadingTime from "reading-time";

export type UpdateFailureReason =
  | CompileFailureReason
  | ValidateSlugFailureReason
  | GetOldManifestFailureReason
  | ResolvePostFailureReason;

const processPost = async ({
  slug,
  metadata,
  sourceFileText,
  sourceFilePath,
  options,
  oldManifest,
  resolvedOutputDir,
}: {
  slug: string;
  metadata: PostMetaFileData;
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
    ...metadata,
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

  for await (const markdownFileInfo of recurseDirectory(resolvedSourceDir, {
    include: [/\.md$/],
  })) {
    const slug = getSlug(markdownFileInfo.relativeFilePath);

    const slugValidation = validateSlug(slug);
    if (!slugValidation.success) {
      return slugValidation;
    }

    const postDataResult = await resolvePost(markdownFileInfo.filePath);
    if (!postDataResult.success) {
      if (
        postDataResult.reason === "no frontmatter in markdown file" ||
        postDataResult.reason === "json file not found"
      ) {
        continue;
      }
      return postDataResult;
    }

    const { content, metadata } = postDataResult.value;

    if (!metadata.publish && !options.includeUnpublished) {
      continue;
    }

    const result = await processPost({
      slug,
      metadata,
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
