const paths = require("./paths");

const config = {
  compress: true,
  contentBase: paths.appPublic,
  watchContentBase: true,
  hot: true,
  open: false,
  overlay: {
    errors: true,
    warnings: true
  },
  watchOptions: {
    ignored: "/node_modules/"
  },
  disableHostCheck: true
};

console.log("webpackDevServer.config", JSON.stringify(config, null, 2));

module.exports = config;