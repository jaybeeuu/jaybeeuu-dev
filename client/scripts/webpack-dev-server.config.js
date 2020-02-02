const paths = require("./paths");

module.exports = {
  quiet: true,
  compress: true,
  contentBase: paths.appPublic,
  watchContentBase: true,
  hot: true,
  overlay: {
    errors: true
  },
  watchOptions: {
    ignored: "/node_modules/"
  }
};
