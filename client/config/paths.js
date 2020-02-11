
const path = require("path");
const fs = require("fs");

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

const certs = resolveApp("certs");

module.exports = {
  appBuild: resolveApp("dist"),
  appBundle: "bundle.js",
  appPublic: resolveApp("public"),
  appHtml: resolveApp("public/index.html"),
  appIndex: resolveApp("src/index.tsx"),
  appSrc: resolveApp("src"),
  appPackageJson: resolveApp("package.json"),
  certs: {
    key: path.join(certs, "private.key"),
    certificate: path.join(certs, "certificate.crt")
  }
};
