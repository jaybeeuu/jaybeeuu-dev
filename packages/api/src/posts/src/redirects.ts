import fs from "fs";
import { canAccess } from "../../files";
import { POST_REDIRECTS_FILE_PATH } from "../../paths";

export interface PostRedirectsMap {
  [oldHash: string]: string;
}

export const getPostRedirects = async (): Promise<PostRedirectsMap> => {
  return await canAccess(POST_REDIRECTS_FILE_PATH)
    ? JSON.parse(await fs.promises.readFile(POST_REDIRECTS_FILE_PATH, "utf8"))
    : {};
};

export const writePostRedirects = async (postRedirects: PostRedirectsMap): Promise<void> => {
  return fs.promises.writeFile(POST_REDIRECTS_FILE_PATH, JSON.stringify(postRedirects, null, 2), "utf8");
};
