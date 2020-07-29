const { base, mergeConfig } = require('@bickley-wallace/config-eslint');

const config = mergeConfig(
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

console.log(JSON.stringify(config, null, 2));

module.exports = config;