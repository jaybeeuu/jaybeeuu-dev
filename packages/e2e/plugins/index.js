const webpackPreprocessor = require("@cypress/webpack-preprocessor");
const webpackOptions = require("../webpack.config");

module.exports = (on) => {
  const options = { webpackOptions };
  const preprocessor = webpackPreprocessor(options);

  on("file:preprocessor", function (...args) {
    return preprocessor(...args);
  });
};
