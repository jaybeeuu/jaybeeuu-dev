import fs from "fs";
import path from "path";
import { recurseDirectory, FileInfo } from "../../files";
import { POSTS_REPO_DIRECTORY, POSTS_DIST_DIRECTORY } from "../../paths";
import { writePostManifest, getPostManifest, PostMetaData } from "./manifest";
import { writePostRedirects, getPostRedirects } from "./redirects";
import { compilePost } from "./compile";
import { getPostFileName } from "..";

type PostMetaFileData = Pick<PostMetaData, "abstract" | "title">;

const isPostMetaFile = (x: any): x is PostMetaFileData => {
  if (typeof x !== "object") {
    return false;
  }

  return typeof x.abstract === "string"
    && typeof x.title === "string";
};

const getMetaFileContent = async (markdownFileInfo: FileInfo): Promise<PostMetaFileData> => {
  const metaFilePath = markdownFileInfo.filePath.replace(/.md$/, ".json");

  try {
    const metaFileContent = await fs.promises.readFile(metaFilePath, "utf8");
    const metadata = JSON.parse(metaFileContent);

    if (isPostMetaFile(metadata)) {
      return metadata;
    } else {
      throw new Error("Metadata does not match the expected interface.");
    }
  } catch (error) {
    throw new Error(`Error processing meta file for ${markdownFileInfo.fileName}\n\n${error.message || error}`);
  }
};

export const update = async (): Promise<void> => {
  const [manifest, postRedirects] = await Promise.all([
    getPostManifest(),
    getPostRedirects(),
    fs.promises.mkdir(POSTS_DIST_DIRECTORY, { recursive: true })
  ]);

  for await(const markdownFileInfo of recurseDirectory(POSTS_REPO_DIRECTORY, { include: [/\.md$/]})) {
    const slug = markdownFileInfo.fileName.split(".")[0];
    const compiledPost = await compilePost(markdownFileInfo.filePath);
    const compiledFileName = getPostFileName(compiledPost);
    const compiledFilePath = path.join(POSTS_DIST_DIRECTORY, compiledFileName);
    await fs.promises.writeFile(compiledFilePath, compiledPost, "utf8", );
    const href = `/posts/${compiledFileName}`;

    const originalRecord = manifest[slug];
    const hasBeenUpdated = originalRecord && originalRecord.fileName !== compiledFileName;

    if (hasBeenUpdated) {
      postRedirects[originalRecord.fileName] = compiledFileName;
    }

    const metadata = await getMetaFileContent(markdownFileInfo);

    manifest[slug] = {
      ...metadata,
      publishDate: originalRecord?.publishDate || new Date().toUTCString(),
      lastUpdateDate: hasBeenUpdated ? new Date().toUTCString() : null,
      slug,
      fileName: compiledFileName,
      href
    };
  }

  await Promise.all([
    writePostManifest(manifest),
    writePostRedirects(postRedirects)
  ]);
};
