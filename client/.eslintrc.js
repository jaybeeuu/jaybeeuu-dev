module.exports = {
  env: {
    es6: true,
    browser: true
  },
  plugins: [
    "@typescript-eslint",
    "react",
    "jest"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    sourceType: "module",
    project: "./tsconfig.json"
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  parser: "babel-eslint",
  parserOptions: {
    sourceType: "module",
    allowImportExportEverywhere: false,
    codeFrame: true,
    ecmaVersion: 2018,
    ecmaFeatures: {
      jsx: true
    }
  },
  settings: {
    react: {
      pragma: "React",
      version: "detect"
    },
    "import/resolver": {
      webpack: {
        "config": "./config/webpack.config.dev.js"
      }
    }
  },
  rules: {
    "no-unused-vars": "off",
    "semi": ["error", "always"],
    "quotes": ["error", "double"],
    "no-console": "error",

    "@typescript-eslint/no-unused-vars": ["error"],
    "@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true }]
  },
  overrides: [
    {
      files: ["./src/**/*.ts"],
      extends: [
        "eslint:recommended"
      ],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        sourceType: "module"
      },
      rules: {
        "@typescript-eslint/unbound-method": ["off"]
      }
    },
    {
      "files": [
        "config/**/*.js",
        "scripts/**/*.js"
      ],
      "env": {
        "node": true,
        "browser": false
      },
      "parserOptions": {
        "sourceType": "module"
      },
      "rules": {
        "no-console": "off"
      }
    }
  ]
};