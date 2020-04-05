import fs from "fs";
import { canAccess } from "../../files";
import { POST_MANIFEST_FILE_PATH } from "../../paths";

export interface PostMeta {
  slug: string;
  title: string;
  fileName: string;
  href: string
}

export interface PostManifest {
  [slug: string]: PostMeta;
}

export const getPostManifest = async (): Promise<PostManifest> => {
  return await canAccess(POST_MANIFEST_FILE_PATH)
    ? JSON.parse(await fs.promises.readFile(POST_MANIFEST_FILE_PATH, "utf8"))
    : {};
};

export const writePostManifest = async (postManifest: PostManifest): Promise<void> => {
  const data = JSON.stringify(postManifest, null, 2);

  return fs.promises.writeFile(POST_MANIFEST_FILE_PATH, data, "utf8");
};