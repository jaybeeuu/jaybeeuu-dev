
const path = require("path");
const fs = require("fs");

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

module.exports = {
  appBuild: resolveApp("dist"),
  appBundle: "bundle.js",
  appPublic: resolveApp("public"),
  appHtml: resolveApp("public/index.html"),
  appIndex: resolveApp("src/index.tsx"),
  appSrc: resolveApp("src"),
  appPackageJson: resolveApp("package.json")
};
