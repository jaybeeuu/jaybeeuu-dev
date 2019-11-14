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
    "@typescript-eslint/no-unused-vars": ["error"],
    "semi": ["error", "always"],
    "quotes": ["error", "double"],
    "no-console": "error"
  },
  overrides: [
    {
      files: [
        "./src/**/*.spec.ts"
      ],
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