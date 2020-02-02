const paths = require("./paths");

module.exports = {
  compress: true,
  contentBase: paths.appPublic,
  hot: true,
  overlay: {
    errors: true
  },
  publicPath: "/",
  quiet: true,
  watchContentBase: true
};
