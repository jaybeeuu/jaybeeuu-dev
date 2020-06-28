const { baseConfig, mergeConfig } = require('@bickley-wallace/config-eslint');

module.exports = mergeConfig(
  baseConfig,
  {
    env: {
      browser: true
    }
  }
);