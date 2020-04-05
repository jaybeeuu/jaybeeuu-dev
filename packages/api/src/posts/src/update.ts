import fs from "fs";
import path from "path";
import { recurseDirectory } from "../../files";
import { POSTS_REPO_DIRECTORY, POSTS_DIST_DIRECTORY } from "../../paths";
import { getHash } from "../../utilities/hash";
import { writePostManifest, getPostManifest } from "./manifest";
import { writePostRedirects, getPostRedirects } from "./redirects";
import { compilePost } from "./compile";

const kebabToTitleCase = (kebab: string):string => {
  return kebab.split("-").map((word) => {
    const firstLetter = word.substring(0,1);
    const rest = word.substring(1);
    return `${firstLetter.toUpperCase()}${rest}`;
  }).join(" ");
};

export const update = async (): Promise<void> => {
  const [manifest, postRedirects] = await Promise.all([
    getPostManifest(),
    getPostRedirects(),
    fs.promises.mkdir(POSTS_DIST_DIRECTORY, { recursive: true })
  ]);

  for await(const markdownFileInfo of recurseDirectory(POSTS_REPO_DIRECTORY, { include: [/\.md$/]})) {
    const slug = markdownFileInfo.fileName.split(".")[0];
    const title = kebabToTitleCase(slug);
    const compiledPost = await compilePost(markdownFileInfo.filePath);
    const compiledFileHash = getHash(compiledPost);
    const compiledFileName = `${compiledFileHash}.html`;
    const compiledFilePath = path.join(POSTS_DIST_DIRECTORY, compiledFileName);
    await fs.promises.writeFile(compiledFilePath, compiledPost, "utf8", );
    const href = `/posts/${compiledFileName}`;

    const originalRecord = manifest[slug];
    if (originalRecord) {
      postRedirects[originalRecord.fileName] = compiledFileName;
    }

    manifest[slug] = { slug, title, fileName: compiledFileName, href };
  }

  await Promise.all([
    writePostManifest(manifest),
    writePostRedirects(postRedirects)
  ]);
};