import path from "path";
import fs from "fs";

const appDirectory = fs.realpathSync(process.cwd());

/** @param {string} relativePath */
const resolveApp = (relativePath) => path.resolve(appDirectory, relativePath);

const certs = resolveApp("certs");

export const paths = {
  dist: resolveApp("dist"),
  public: resolveApp("public"),
  indexHtml: resolveApp("public/index.html"),
  srcIndex: resolveApp("src/index.tsx"),
  src: resolveApp("src"),
  packageJson: resolveApp("package.json"),
  certs: {
    key: path.join(certs, "key.key"),
    certificate: path.join(certs, "cert.crt")
  },
  manifest: resolveApp("node_modules/@jaybeeuu/posts/lib/manifest.json"),
  postsLib: "node_modules/@jaybeeuu/posts/lib"
};
