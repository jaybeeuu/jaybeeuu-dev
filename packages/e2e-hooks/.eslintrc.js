const { base, mergeConfig } = require('@bickley-wallace/config-eslint');

module.exports = mergeConfig(
  base,
  {
    env: {
      browser: true
    }
  }
);