import { joinUrlPath } from"@bickley-wallace/utilities";
import path from "path";
import {
  recurseDirectory,
  writeJsonFile,
  writeTextFile,
  deleteDirectories
} from "../../files";
import type { Result} from "../../results";
import { success } from "../../results";
import { compilePost } from "./compile";
import type { GetMetaFileContentFailure } from "./metafile";
import { getMetaFileContent } from "./metafile";
import type {
  ValidateSlugFailureReason
} from "./file-paths";
import {
  getCompiledPostFileName,
  getPostMarkdownFilePath,
  validateSlug
} from "./file-paths";
import type { UpdateOptions, PostManifest } from "./types";
import type { GetManifestFailure } from "./manifest";
import { getManifest } from "./manifest";

export type UpdateFailureReason
 = ValidateSlugFailureReason
 | GetManifestFailure
 | GetMetaFileContentFailure;

export const update = async (
  options: UpdateOptions
): Promise<Result<PostManifest, UpdateFailureReason>> => {
  const oldManifestReadResult = await getManifest(path.join(options.outputDir, options.manifestFileName));
  if (!oldManifestReadResult.success) {
    return oldManifestReadResult;
  }

  const oldManifest = oldManifestReadResult.value;
  const newManifest: PostManifest = {};
  const resolvedOutputDir = path.resolve(options.outputDir);
  const resolvedSourceDir = path.resolve(options.sourceDir);

  await deleteDirectories(resolvedOutputDir);

  for await (const metadataFileInfo of recurseDirectory(
    resolvedSourceDir,
    { include: [/.post.json$/] })
  ) {
    const slug = metadataFileInfo.fileName.split(".")[0];
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
    const compiledPost = await compilePost(postMarkdownFilePath, { postSlug: slug, hrefRoot: options.hrefRoot });
    const compiledFileName = getCompiledPostFileName(slug, compiledPost);
    const compiledFilePath = path.join(resolvedOutputDir, compiledFileName);
    await writeTextFile(compiledFilePath, compiledPost);
    const href = joinUrlPath(options.hrefRoot, compiledFileName);

    const originalRecord = oldManifest[slug];
    const hasBeenUpdated = originalRecord && originalRecord.fileName !== compiledFileName;

    newManifest[slug] = {
      ...metaData,
      publishDate: originalRecord?.publishDate || new Date().toUTCString(),
      lastUpdateDate: hasBeenUpdated ? new Date().toUTCString() : null,
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
