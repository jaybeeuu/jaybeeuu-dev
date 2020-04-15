import { canAccess, readTextFile, writeTextFile } from "../../files";
import { POST_MANIFEST_FILE_PATH } from "../../paths";

export interface PostMetaData {
  abstract: string;
  fileName: string;
  href: string;
  lastUpdateDate: string | null;
  publishDate: string;
  slug: string;
  title: string;
}

export interface PostManifest {
  [slug: string]: PostMetaData;
}

export const getPostManifest = async (): Promise<PostManifest> => {
  return await canAccess(POST_MANIFEST_FILE_PATH)
    ? JSON.parse(await readTextFile(POST_MANIFEST_FILE_PATH))
    : {};
};

export const writePostManifest = async (postManifest: PostManifest): Promise<void> => {
  const data = JSON.stringify(postManifest, null, 2);

  return writeTextFile(POST_MANIFEST_FILE_PATH, data);
};