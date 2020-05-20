const webpackPreprocessor = require("@cypress/webpack-preprocessor");
const webpackOptions = require("../webpack.config");

module.exports = (on) => {
  const options = { webpackOptions };

  on("file:preprocessor", webpackPreprocessor(options));
};