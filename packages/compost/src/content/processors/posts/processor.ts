import type { Result } from "@jaybeeuu/utilities";
import { failure, joinUrlPath, log, success } from "@jaybeeuu/utilities";
import path from "path";
import getReadingTime from "reading-time";
import type { FileInfo } from "../../../files/index.js";
import {
  copyFile,
  deleteDirectories,
  writeJsonFile,
  writeTextFile,
} from "../../../files/index.js";
import type { CompileFailureReason } from "../../compile";
import { compilePost } from "../../compile";
import type { ValidateSlugFailureReason } from "../../file-paths";
import {
  getCompiledPostFileName,
  getSlug,
  validateSlug,
} from "../../file-paths";
import type {
  OldPostManifest,
  PostUpdater,
  ProcessingOutcome,
  UpdateOptions,
} from "../../types";
import { resolveContent } from "../../content-resolver.js";
import { contentResolverConfig } from "../../resolver-config.js";
import type { GetOldManifestFailureReason } from "../../old-manifest.js";
import { getOldManifest } from "../../old-manifest.js";
import type { PostManifest, PostMetadata, PostMetaFileData } from "./types.js";

export type ProcessPostFailureReason =
  | CompileFailureReason
  | ValidateSlugFailureReason
  | GetOldManifestFailureReason
  | "content-resolve-failure";

export const processPost = async ({
  slug,
  metadata,
  sourceFileText,
  sourceFilePath,
  options,
  oldManifest,
}: {
  slug: string;
  metadata: PostMetaFileData;
  sourceFileText: string;
  sourceFilePath: string;
  options: {
    outputDir: string;
    hrefRoot: string;
    codeLineNumbers: boolean;
    removeH1: boolean;
    resolvedOutputDir: string;
  };
  oldManifest: OldPostManifest;
}): Promise<Result<PostMetadata, ProcessPostFailureReason>> => {
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
  const compiledFilePath = path.join(
    options.resolvedOutputDir,
    compiledFileName,
  );

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

export type MakePostUpdaterFailureReason = GetOldManifestFailureReason;

export type PostUpdaterFailureReason =
  | ValidateSlugFailureReason
  | ProcessPostFailureReason;

export type PostProcessSkippedReason = "no meta detected";
export type PostPostProcessFailureReason = "manifest write failed";

export type PostProcessingResult = Result<
  ProcessingOutcome<PostMetadata, PostProcessSkippedReason>,
  PostUpdaterFailureReason
>;

export const makePostUpdater = async (
  options: {
    clean: boolean;
    includeUnpublished: boolean;
    manifestFileName: string;
    oldManifestLocators: string[];
    requireOldManifest: boolean;
  } & UpdateOptions,
): Promise<
  Result<
    PostUpdater<
      PostMetadata,
      ProcessPostFailureReason,
      PostProcessSkippedReason,
      PostPostProcessFailureReason
    >,
    MakePostUpdaterFailureReason
  >
> => {
  const oldManifestReadResult = await getOldManifest(
    path.join(options.outputDir, options.manifestFileName),
    options.oldManifestLocators,
  );

  const resolvedOutputDir = path.resolve(options.outputDir);

  if (options.clean) {
    await deleteDirectories(resolvedOutputDir);
  }

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

  return success({
    processFile: async (
      markdownFileInfo: FileInfo,
    ): Promise<PostProcessingResult> => {
      const slug = getSlug(markdownFileInfo.relativeFilePath);

      const slugValidation = validateSlug(slug);
      if (!slugValidation.success) {
        return slugValidation;
      }

      const contentResult = await resolveContent(
        markdownFileInfo.filePath,
        contentResolverConfig,
      );
      if (!contentResult.success) {
        if (
          contentResult.reason === "no frontmatter in markdown file" ||
          contentResult.reason === "json file not found"
        ) {
          return success({ outcome: "skipped", reason: "no meta detected" });
        }
        return failure("content-resolve-failure", contentResult.message);
      }

      if (contentResult.value.type !== "post") {
        return failure(
          "content-resolve-failure",
          `Expected post content, got ${contentResult.value.type}`,
        );
      }

      const { content, metadata } = contentResult.value;

      // Type assertion is safe because we already checked type === "post"
      const postMetadata = metadata as PostMetaFileData;

      if (!postMetadata.publish && !options.includeUnpublished) {
        return success();
      }

      const result = await processPost({
        slug,
        metadata: postMetadata,
        sourceFileText: content,
        sourceFilePath: markdownFileInfo.filePath,
        options: { ...options, resolvedOutputDir },
        oldManifest,
      });

      if (!result.success) {
        return result;
      }

      newManifest[slug] = result.value;

      return success({
        outcome: "compiled",
        metadata: result.value,
      });
    },
    postProcess: async (): Promise<
      Result<void, PostPostProcessFailureReason>
    > => {
      try {
        await writeJsonFile(
          path.resolve(options.outputDir, options.manifestFileName),
          newManifest,
        );
        return success();
      } catch (error) {
        return failure("manifest write failed", error);
      }
    },
    get newManifest() {
      return newManifest;
    },
  });
};
