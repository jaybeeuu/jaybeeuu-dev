const { baseConfig, mergeConfig } = require('@bickley-wallace/config-eslint');

module.exports = mergeConfig(
  baseConfig,
  {
    env: {
      browser: true
    },
    plugins: [
      "react",
    ],
    settings: {
      react: {
        pragma: "h",
        version: "detect"
      },
      "import/resolver": {
        webpack: {
          "config": "./config/webpack.config.js"
        }
      }
    },
    extends: [
      "plugin:react/recommended",
    ],
    rules: {
      "react/prop-types": "off",
    }
  }
);