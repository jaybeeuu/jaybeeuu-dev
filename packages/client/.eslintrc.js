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
  settings: {
    react: {
      pragma: "h",
      version: "detect"
    },
    "import/resolver": {
      webpack: {
        "config": "./config/webpack.config.js"
      }
    }
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:jest/all"
  ],
  rules: {
    "indent": ["error", 2],
    "no-console": "error",
    "no-unused-vars": "off",
    "quotes": ["error", "double"],
    "semi": ["error", "always"],

    "react/prop-types": "off",

    "jest/prefer-expect-assertions": "off"
  },
  overrides: [
    {
      files: [
        "*.ts",
        "*.tsx"
      ],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./tsconfig.json"
      },
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
      ],
      rules: {
        "@typescript-eslint/no-unused-vars": ["error"],
        "@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true }],
      },
    },
    {
      files: [
        "config/**/*.js"
      ],
      parserOptions: {
        ecmaVersion: 2018
      },
      env: {
        node: true,
        browser: false
      },
      rules: {
        "no-console": "off"
      }
    },
    {
      files: [
        "**/*.spec.ts"
      ],
      env: {
        "jest/globals": true
      }
    }
  ]
};