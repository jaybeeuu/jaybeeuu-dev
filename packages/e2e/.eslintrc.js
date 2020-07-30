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
    rules: {
      "cypress/no-assigning-return-values": "error",
      "cypress/no-unnecessary-waiting": "error",
      "cypress/assertion-before-screenshot": "error",
      "cypress/no-force": "error",
      "cypress/no-async-tests": "error"
    },
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