const { base, mergeConfig } = require('@bickley-wallace/config-eslint');

module.exports = mergeConfig(
  base,
  {
    env: {
      node: true
    },
    overrides: {
      typescript: {
        rules: {
          "no-console": ["off"]
        },
      }
    }
  }
);
