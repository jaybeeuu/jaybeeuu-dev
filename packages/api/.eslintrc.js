module.exports = {
  env: {
    es6: true,
    node: true
  },
  plugins: [
    "@typescript-eslint",
    "jest"
  ],
  extends: [
    "eslint:recommended",
    "plugin:jest/all"
  ],
  rules: {
    "no-unused-vars": "off",
    "semi": ["error", "always"],
    "quotes": ["error", "double"],
    "no-console": "error",

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
        sourceType: "module",
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
        "test/**/*.ts",
        "**/*.spec.ts"
      ],
      env: {
        "jest/globals": true
      }
    }
  ]
};