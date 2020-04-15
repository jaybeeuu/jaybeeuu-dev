import { canAccess, writeTextFile, readTextFile } from "../../files";
import { POST_REDIRECTS_FILE_PATH } from "../../paths";

export interface PostRedirectsMap {
  [oldHash: string]: string;
}

export const getPostRedirects = async (): Promise<PostRedirectsMap> => {
  return await canAccess(POST_REDIRECTS_FILE_PATH)
    ? JSON.parse(await readTextFile(POST_REDIRECTS_FILE_PATH))
    : {};
};

export const writePostRedirects = async (postRedirects: PostRedirectsMap): Promise<void> => {
  return writeTextFile(POST_REDIRECTS_FILE_PATH, JSON.stringify(postRedirects, null, 2));
};