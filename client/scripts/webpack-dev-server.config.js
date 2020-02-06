const fs = require("fs");
const env = require("./env");
const paths = require("./paths");

module.exports = {
  compress: true,
  contentBase: paths.appPublic,
  hot: true,
  https: {
    key: fs.readFileSync(paths.certs.key),
    cert: fs.readFileSync(paths.certs.certificate),
  },
  overlay: {
    errors: true
  },
  port: env.PORT,
  quiet: true,
  watchContentBase: true,
};