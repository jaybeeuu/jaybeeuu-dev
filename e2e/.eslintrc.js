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
    "no-unused-vars": "off",
    "semi": ["error", "always"],
    "quotes": ["error", "double"],
    "no-console": "error"
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