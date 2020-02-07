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
      pragma: "React",
      version: "detect"
    },
    "import/resolver": {
      webpack: {
        "config": "./scripts/webpack.config.js"
      }
    }
  },
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "./tsconfig.json"
  },
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  rules: {
    "no-unused-vars": "off",
    "semi": ["error", "always"],
    "quotes": ["error", "double"],
    "no-console": "error",

    "@typescript-eslint/no-unused-vars": ["error"],
    "@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true }],

    "react/prop-types": "off"
  },
  overrides: [
    {
      files: [
        "scripts/**/*.js"
      ],
      env: {
        node: true,
        browser: false
      },
      rules: {
        "no-console": "off"
      }
    }
  ]
};