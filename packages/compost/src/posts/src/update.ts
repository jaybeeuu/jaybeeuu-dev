import type { Result } from "@jaybeeuu/utilities";
import { failure, joinUrlPath, log, success } from "@jaybeeuu/utilities";
import path from "path";
import {
  copyFile,
  deleteDirectories,
  readTextFile,
  recurseDirectory,
  writeJsonFile,
  writeTextFile
} from "../../files/index.js";
import type { CompileFailureReason as CompileFailureReason } from "./compile.js";
import { compilePost } from "./compile.js";
import type {
  ValidateSlugFailureReason as ValidateSlugFailureReason
} from "./file-paths.js";
import {
  getCompiledPostFileName,
  getPostMarkdownFilePath,
  getSlug,
  validateSlug
} from "./file-paths.js";
import type { GetOldManifestFailureReason } from "./manifest.js";
import { getOldManifest } from "./manifest.js";
import type { GetMetaFileContentFailureReason } from "./metafile.js";
import { getMetaFileContent } from "./metafile.js";
import type { OldPostManifest, PostManifest, UpdateOptions } from "./types.js";
import getReadingTime from "reading-time";

export type UpdateFailureReason
 = CompileFailureReason
 | ValidateSlugFailureReason
 | GetOldManifestFailureReason
 | GetMetaFileContentFailureReason
 | LoadSourceFailureReason;

export type LoadSourceFailureReason = `Failed to load file ${string}`;

const loadPostSourceText = async (sourceFilePath: string): Promise<Result<string, LoadSourceFailureReason>> => {
  try {
    const postText = await readTextFile(sourceFilePath);

    return success(postText);
  } catch (error) {
    return failure(`Failed to load file ${sourceFilePath}`, error);
  }
};

export const update = async (
  options: UpdateOptions
): Promise<Result<PostManifest, UpdateFailureReason>> => {
  const oldManifestReadResult = await getOldManifest(
    path.join(options.outputDir, options.manifestFileName),
    options.oldManifestLocators
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

  for await (const metadataFileInfo of recurseDirectory(
    resolvedSourceDir,
    { include: [/.post.json$/] })
  ) {
    const slug = getSlug(metadataFileInfo.relativeFilePath);
    const slugValidation = validateSlug(slug);

    if (!slugValidation.success) {
      return slugValidation;
    }

    const metaFileContentResult = await getMetaFileContent(metadataFileInfo);
    if (!metaFileContentResult.success) {
      return metaFileContentResult;
    }

    const metaData = metaFileContentResult.value;
    if (!metaData.publish && !options.includeUnpublished){
      continue;
    }

    const postMarkdownFilePath = getPostMarkdownFilePath(metadataFileInfo.absolutePath, slug);

    const sourceFileText = await loadPostSourceText(postMarkdownFilePath);
    if (!sourceFileText.success) {
      return sourceFileText;
    }

    const compiledPostResult = await compilePost({
      codeLineNumbers: options.codeLineNumbers,
      hrefRoot: options.hrefRoot,
      removeH1: options.removeH1,
      sourceFilePath: postMarkdownFilePath,
      sourceFileText: sourceFileText.value
    });

    if (!compiledPostResult.success) {
      return compiledPostResult;
    }

    const { html: compiledPost, assets } = compiledPostResult.value;

    const compiledFileName = getCompiledPostFileName(slug, compiledPost);
    const compiledFilePath = path.join(resolvedOutputDir, compiledFileName);

    await Promise.all([
      writeTextFile(compiledFilePath, compiledPost),
      ...assets.map((asset) => copyFile(
        asset.sourcePath,
        path.join(options.outputDir, asset.destinationPath)
      ))
    ]);

    const href = joinUrlPath(options.hrefRoot, compiledFileName);

    const originalRecord = oldManifest[slug];

    const publishDate = new Date(originalRecord?.publishDate ?? new Date()).toISOString();

    const hasBeenUpdated = originalRecord && originalRecord.fileName !== compiledFileName;
    const lastUpdateDate = hasBeenUpdated
      ? new Date().toISOString()
      : originalRecord?.lastUpdateDate
        ? new Date(originalRecord.lastUpdateDate).toISOString()
        : null;

    const readingTime = getReadingTime(sourceFileText.value);

    newManifest[slug] = {
      ...metaData,
      fileName: compiledFileName,
      href,
      lastUpdateDate,
      publishDate,
      readingTime,
      slug
    };
  }

  await writeJsonFile(
    path.resolve(options.outputDir, options.manifestFileName),
    newManifest
  );

  return success(newManifest);
};
