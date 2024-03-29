// @ts-check

import path from "node:path";
import fs from "node:fs";

const appDirectory = fs.realpathSync(process.cwd());

/**
 * @param {string} relativePath
 * @returns {string}
 */
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

export const paths = {
  dist: resolveApp("dist"),
  public: resolveApp("public"),
  indexHtml: resolveApp("public/index.html"),
  srcIndex: resolveApp("src/index.tsx"),
  src: resolveApp("src"),
  certs: {
    key: resolveApp("certs/key.key"),
    certificate: resolveApp("src/cert.crt"),
  },
  manifest: resolveApp("node_modules/@jaybeeuu/posts/lib/manifest.json"),
  postsLib: "node_modules/@jaybeeuu/posts/lib",
};
