const { baseConfig, mergeConfig } = require('@bickley-wallace/config-eslint');

module.exports = mergeConfig(
  baseConfig,
  {
    env: {
      node: true,
      "cypress/globals": true
    },
    plugins: [
      ...baseConfig.plugins,
      "cypress"
    ],
    extends: [
      ...baseConfig.extends,
      "plugin:cypress/recommended"
    ]
  }
);