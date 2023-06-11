import type { Result } from "@jaybeeuu/utilities";
import { joinUrlPath, log, success } from "@jaybeeuu/utilities";
import path from "path";
import {
  copyFile,
  deleteDirectories,
  recurseDirectory,
  writeJsonFile,
  writeTextFile
} from "../../files/index.js";
import type { CompileFailureReason } from "./compile.js";
import { compilePost } from "./compile.js";
import type {
  ValidateSlugFailureReason
} from "./file-paths.js";
import {
  getCompiledPostFileName,
  getPostMarkdownFilePath,
  getSlug,
  validateSlug
} from "./file-paths.js";
import type { GetManifestFailure } from "./manifest.js";
import { getManifest } from "./manifest.js";
import type { GetMetaFileContentFailure } from "./metafile.js";
import { getMetaFileContent } from "./metafile.js";
import type { PostManifest, UpdateOptions } from "./types.js";

export type UpdateFailureReason
 = CompileFailureReason
 | ValidateSlugFailureReason
 | GetManifestFailure
 | GetMetaFileContentFailure;

export const update = async (
  options: UpdateOptions
): Promise<Result<PostManifest, UpdateFailureReason>> => {
  const oldManifestReadResult = await getManifest(
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

  const oldManifest: PostManifest = oldManifestReadResult.success ? oldManifestReadResult.value : {};
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
    const compiledPostResult = await compilePost({
      codeLineNumbers: options.codeLineNumbers,
      hrefRoot: options.hrefRoot,
      removeH1: options.removeH1,
      sourceFilePath: postMarkdownFilePath
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

    newManifest[slug] = {
      ...metaData,
      publishDate,
      lastUpdateDate,
      slug,
      fileName: compiledFileName,
      href
    };
  }

  await writeJsonFile(
    path.resolve(options.outputDir, options.manifestFileName),
    newManifest
  );

  return success(newManifest);
};
