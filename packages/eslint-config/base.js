module.exports = {
  env: {
    es6: true,
  },
  plugins: ["@typescript-eslint"],
  extends: ["eslint-config-prettier", "eslint:recommended"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
    ecmaVersion: "latest",
    sourceType: "module",
  },
  rules: {
    "no-console": "error",
    "no-shadow": "error",
    "no-unused-vars": "off",
  },
  overrides: [
    {
      files: ["*.ts", "*.tsx"],
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended-type-checked",
        "plugin:@typescript-eslint/strict",
        "plugin:@typescript-eslint/strict-type-checked",
      ],
      rules: {
        "@typescript-eslint/consistent-indexed-object-style": [
          "error",
          "index-signature",
        ],
        "@typescript-eslint/consistent-type-imports": [
          "error",
          { prefer: "type-imports" },
        ],
        "@typescript-eslint/explicit-function-return-type": [
          "error",
          { allowExpressions: true },
        ],
        "@typescript-eslint/no-misused-promises": [
          "error",
          { checksVoidReturn: false },
        ],
        "@typescript-eslint/no-shadow": "error",
        "@typescript-eslint/no-unnecessary-condition": [
          "error",
          { allowConstantLoopConditions: true },
        ],
        "@typescript-eslint/no-unused-vars": [
          "error",
          { ignoreRestSiblings: true },
        ],
        "@typescript-eslint/switch-exhaustiveness-check": "error",
        "no-shadow": "off",
        "no-unused-vars": "off",
      },
    },
    {
      files: ["*.cjs"],
      env: {
        node: true,
      },
    },
    {
      files: [".*rc.js", "*.config.js", "config/**/*.js"],
      env: {
        browser: false,
        node: true,
      },
      rules: {
        "no-console": "off",
      },
    },
  ],
};
