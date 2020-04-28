import path from "path";
import { recurseDirectory, FileInfo, canAccess, writeTextFile, readTextFile, deleteFile } from "../../files";
import { POSTS_REPO_DIRECTORY, POSTS_DIST_DIRECTORY } from "../../paths";
import { writePostManifest, getPostManifest, PostMetaData, PostManifest } from "./manifest";
import { writePostRedirects, getPostRedirects } from "./redirects";
import { compilePost } from "./compile";
import { getPostFileName } from "../index";
import { Result, success, failure, ResultState } from "../../results";
import { resolvePostFilePath } from "./file-paths";

type PostMetaFileData = Pick<PostMetaData, "abstract" | "title">;
const MARKDOWN_FILE_EXTENSION = /.md$/;

const isPostMetaFile = (x: any): x is PostMetaFileData => {
  if (typeof x !== "object") {
    return false;
  }

  return typeof x.abstract === "string"
    && typeof x.title === "string";
};

const getMetaFileContent = async (markdownFileInfo: FileInfo): Promise<Result<PostMetaFileData>> => {
  const metaFileName = markdownFileInfo.fileName.replace(MARKDOWN_FILE_EXTENSION, ".json");
  const metaFilePath = path.join(markdownFileInfo.absolutePath, metaFileName);

  if (! await canAccess(metaFilePath)) {
    return failure(`Metafile ${metaFileName} for the post ${markdownFileInfo.fileName} was missing.`);
  }

  const metaFileContent = await readTextFile(metaFilePath);
  const metadata = JSON.parse(metaFileContent);

  if (isPostMetaFile(metadata)) {
    return success(metadata);
  } else {
    return failure(
      `Metadata for ${markdownFileInfo.fileName} in ${metaFileName} does not contain the expected information.`
    );
  }
};

const collectGarbage = async (
  oldManifest: PostManifest,
  newManifest: PostManifest
): Promise<void[]> => {
  return Promise.all(
    Object.entries(oldManifest).filter(([slug]) => {
      return newManifest[slug] === undefined;
    }).map(([, postMetaData]): Promise<void> => {
      return deleteFile(resolvePostFilePath(postMetaData.fileName));
    })
  );
};

export const update = async (): Promise<Result<void>> => {
  const postRedirects = { ...await getPostRedirects() };
  const oldManifest = await getPostManifest();
  const newManifest: PostManifest = {};

  for await(const markdownFileInfo of recurseDirectory(POSTS_REPO_DIRECTORY, { include: [MARKDOWN_FILE_EXTENSION] })) {
    const slug = markdownFileInfo.fileName.split(".")[0];
    const compiledPost = await compilePost(markdownFileInfo.filePath);
    const compiledFileName = getPostFileName(compiledPost);
    const compiledFilePath = path.join(POSTS_DIST_DIRECTORY, compiledFileName);
    await writeTextFile(compiledFilePath, compiledPost);
    const href = `/posts/${compiledFileName}`;

    const originalRecord = oldManifest[slug];
    const hasBeenUpdated = originalRecord && originalRecord.fileName !== compiledFileName;

    if (hasBeenUpdated) {
      postRedirects[originalRecord.fileName] = compiledFileName;
    }

    const result = await getMetaFileContent(markdownFileInfo);
    if (result.state === ResultState.failure) {
      return result;
    }

    newManifest[slug] = {
      ...result.value,
      publishDate: originalRecord?.publishDate || new Date().toUTCString(),
      lastUpdateDate: hasBeenUpdated ? new Date().toUTCString() : null,
      slug,
      fileName: compiledFileName,
      href
    };
  }
  await Promise.all([
    collectGarbage(oldManifest, newManifest),
    writePostManifest(newManifest),
    writePostRedirects(postRedirects)
  ]);

  return success();
};
