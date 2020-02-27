module.exports = {
  env: {
    node: true,
    es6: true
  },
  plugins: [
    "@typescript-eslint",
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
  rules: {
    "no-unused-vars": "off",
    "semi": ["error", "always"],
    "quotes": ["error", "double"],
    "no-console": "error",

    "@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true }],
    "@typescript-eslint/no-unused-vars": ["error"],
    "@typescript-eslint/unbound-method": ["off"]
  },
  overrides: [
    {
      files: [
        "./src/**/*.spec.ts"
      ],
      env: {
        "jest/globals": true
      },
    }
  ]
};