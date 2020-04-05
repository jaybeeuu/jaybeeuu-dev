import path from "path";
import fs from "fs";
import { FILES_ROOT } from "./env";

const appDirectory = fs.realpathSync(process.cwd());
export const resolveApp = (...pathSegments: string[]): string => path.resolve(appDirectory, ...pathSegments);

export const POST_REDIRECTS_FILE_PATH = resolveApp(FILES_ROOT, "post-redirects.json");
export const POST_MANIFEST_FILE_PATH = resolveApp(FILES_ROOT, "post-manifest.json");
export const POSTS_DIST_DIRECTORY = resolveApp(FILES_ROOT, "posts");
export const POSTS_REPO_DIRECTORY = resolveApp(FILES_ROOT, "repo");
export const certs = {
  key: resolveApp("certs/private.key"),
  certificate: resolveApp("certs/certificate.crt")
};
