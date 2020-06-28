const { base, jest, mergeConfig } = require('@bickley-wallace/config-eslint');

module.exports = mergeConfig(
  jest,
  base,
  {
    env: {
      node: true
    }
  }
);