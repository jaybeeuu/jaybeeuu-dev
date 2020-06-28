const { base, mergeConfig } = require('@bickley-wallace/config-eslint');

module.exports = mergeConfig(
  base,
  {
    env: {
      node: true,
      "cypress/globals": true
    },
    plugins: [
      "cypress"
    ],
    extends: [
      "plugin:cypress/recommended"
    ]
  }
);