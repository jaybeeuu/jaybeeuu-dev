module.exports = {
  env: {
    es6: true,
    browser: true
  },
  plugins: [
    "@typescript-eslint",
  ],
  extends: [
    "eslint:recommended",
  ],
  rules: {
    "indent": ["error", 2],
    "no-console": "error",
    "no-unused-vars": "off",
    "quotes": ["error", "double"],
    "semi": ["error", "always"],
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
      }
    }
  ]
};