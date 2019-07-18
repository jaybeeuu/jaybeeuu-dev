const paths = require("./paths");

module.exports = {
  compress: true,
  contentBase: paths.appPublic,
  watchContentBase: true,
  hot: true,
  open: true,
  overlay: {
    errors: true,
    warnings: true
  },
  watchOptions: {
    ignored: "/node_modules/"
  }
};
