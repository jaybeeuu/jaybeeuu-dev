# eslint-config

[![npm](https://img.shields.io/npm/v/@jaybeeuu/eslint-config.svg)](https://www.npmjs.com/package/@jaybeeuu/eslint-config)

Eslint config used by the packages in this repo to ensure consistent rules throughout.

There are two rule sets, `base`,
use by all packages and `jest` which adds configuration for jest unit tests.

## usage

```json
{
  "extends": ["@jaybeeuu/eslint-config/base"]
}
```
