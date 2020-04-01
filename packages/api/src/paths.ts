import path from "path";
import fs from "fs";
import { FILES_ROOT } from "./env";

const appDirectory = fs.realpathSync(process.cwd());
export const resolveApp = (...pathSegments: string[]): string => path.resolve(appDirectory, ...pathSegments);

export const POST_DIST_DIRECTORY = resolveApp(FILES_ROOT, "dist");
export const POST_REPO_DIRECTORY = resolveApp(FILES_ROOT, "depo");
export const certs = {
  key: resolveApp("certs/private.key"),
  certificate: resolveApp("certs/certificate.crt")
};
