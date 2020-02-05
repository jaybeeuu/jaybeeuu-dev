const fs = require("fs");
const env = require("./env");
const paths = require("./paths");

module.exports = {
  compress: true,
  contentBase: paths.appPublic,
  port: env.PORT,
  https: {
    key: fs.readFileSync(paths.certs.key),
    cert: fs.readFileSync(paths.certs.certificate),
  },
  hot: true,
  overlay: {
    errors: true
  },
  quiet: true,
  watchContentBase: true
};