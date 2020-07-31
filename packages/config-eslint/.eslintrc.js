const { base, mergeConfig } = require("./index");

module.exports = mergeConfig(
  base,
  {
    env: {
      node: true
    },
    parserOptions: {
      ecmaVersion: 2019
    },
    overrides: {
      typescript: {
        rules: {
          "no-console": ["off"]
        }
      }
    }
  }
);
