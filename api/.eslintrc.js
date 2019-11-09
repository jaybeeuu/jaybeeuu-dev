module.exports = {
  parserOptions: {
    ecmaVersion: 2018,
  },
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
    project: "./tsconfig.eslint.json"
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/eslint-recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking"
  ],
  rules: {
    "semi": ["error", "always"]
  },
  overrides: [
    {
      files: ["./src/**/*.spec.ts"],
      env: {
        "jest/globals": true
      },
    },
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
    }
  ]
};