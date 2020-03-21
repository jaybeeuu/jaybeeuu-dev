import path from "path";
import fs from "fs";
import { POST_DIST_DIRECTORY, POST_REPO_DIRECTORY } from "./env";

const appDirectory = fs.realpathSync(process.cwd());
export const resolveApp = (relativePath: string ): string => path.resolve(appDirectory, relativePath);

export const postDistDirectory = resolveApp(POST_DIST_DIRECTORY);
export const postRepoDirectory = resolveApp(POST_REPO_DIRECTORY);
export const certs = {
  key: resolveApp("certs/private.key"),
  certificate: resolveApp("certs/certificate.crt")
};
