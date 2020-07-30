const { base, mergeConfig } = require('@bickley-wallace/config-eslint');

module.exports = mergeConfig(
  base,
  {
    env: {
      "browser": true,
      "cypress/globals": true
    },
    plugins: [
      "cypress"
    ],
    extends: [
      "plugin:cypress/recommended"
    ],
    overrides: [
      {
        "files": ["cypress/plugins/**/*"],
        env: {
          "browser": false,
          "node": true
        }
      }
    ]
  }
);