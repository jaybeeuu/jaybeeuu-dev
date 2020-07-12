
const path = require("path");
const fs = require("fs");

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const certs = resolveApp("certs");

module.exports = {
  dist: resolveApp("dist"),
  bundle: "bundle.js",
  public: resolveApp("public"),
  indexHtml: resolveApp("public/index.html"),
  srcIndex: resolveApp("src/index.tsx"),
  src: resolveApp("src"),
  packageJson: resolveApp("package.json"),
  certs: {
    key: path.join(certs, "client.bickley-wallace.com.key"),
    certificate: path.join(certs, "client.bickley-wallace.com.crt")
  }
};
