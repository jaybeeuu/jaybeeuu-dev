module.exports = {
  env: {
    node: true,
    "cypress/globals": true
  },
  plugins: [
    "@typescript-eslint",
    "cypress"
  ],
  settings: {
  },
  extends: [
    "eslint:recommended",
    "plugin:cypress/recommended"
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
        "*.ts"
      ],
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./tsconfig.json"
      },
      extends: [
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