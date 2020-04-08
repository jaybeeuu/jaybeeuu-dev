import path from "path";
import { POSTS_DIST_DIRECTORY } from "../../paths";
import { getHash } from "../../utilities/hash";

const POST_FILE_REGEXP = /[a-fA-F0-9]{40}\.html/;

export const getPostFileName = (fileContent: string): string => {
  const compiledFileHash = getHash(fileContent);
  return `${compiledFileHash}.html`;
};

export const resolvePostFilePath = (name: string): string => {
  if (!POST_FILE_REGEXP.exec(name)) {
    throw new Error("Invlid file name");
  }

  return path.join(POSTS_DIST_DIRECTORY, name);
};