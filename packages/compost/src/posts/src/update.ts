import path from "path";
import {
  readJsonFile,
  recurseDirectory,
  writeJsonFile,
  writeTextFile,
  deleteDirectories
} from "../../files";
import { Result, success, ResultState } from "../../results";
import { compilePost } from "./compile";
import { MARKDOWN_FILE_EXTENSION } from "./constants";
import { getMetaFileContent } from "./metafile";
import { validateSlug, getPostFileName } from "./file-paths";
import { UpdateOptions, PostManifest } from "./types";

const joinUrlPath = (...pathFragments: string[]): string => {
  const builtPath = pathFragments
    .map((fragment) => fragment.replace(/(^\/|\/$)/g, ""))
    .filter(Boolean)
    .join("/");
  return `/${builtPath}`;
};

export const update = async (
  options: UpdateOptions
): Promise<Result<PostManifest>> => {
  const oldManifest = await readJsonFile<PostManifest>(
    path.join(options.outputDir, options.manifestFileName),
    {}
  );

  const newManifest: PostManifest = {};
  const resolvedOutputDir = path.resolve(options.outputDir);
  const resolvedSourceDir = path.resolve(options.sourceDir);

  await deleteDirectories(resolvedOutputDir);

  for await (const markdownFileInfo of recurseDirectory(
    resolvedSourceDir,
    { include: [MARKDOWN_FILE_EXTENSION] })
  ) {
    const slug = markdownFileInfo.fileName.split(".")[0];
    const slugValidation = validateSlug(slug);

    if (slugValidation.state === ResultState.failure) {
      return slugValidation;
    }

    const compiledPost = await compilePost(markdownFileInfo.filePath);
    const compiledFileName = getPostFileName(slug, compiledPost);
    const compiledFilePath = path.join(resolvedOutputDir, compiledFileName);
    await writeTextFile(compiledFilePath, compiledPost);
    const href = joinUrlPath(options.hrefRoot, compiledFileName);

    const metaFileContentResult = await getMetaFileContent(markdownFileInfo);
    if (metaFileContentResult.state === ResultState.failure) {
      return metaFileContentResult;
    }

    const originalRecord = oldManifest[slug];
    const hasBeenUpdated = originalRecord && originalRecord.fileName !== compiledFileName;

    newManifest[slug] = {
      ...metaFileContentResult.value,
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
