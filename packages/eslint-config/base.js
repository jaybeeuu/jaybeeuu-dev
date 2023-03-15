module.exports = {
  env: {
    es6: true
  },
  plugins: [
    "@typescript-eslint"
  ],
  extends: [
    "eslint:recommended"
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
    ecmaVersion: "latest",
    sourceType: "module"
  },
  rules: {
    "comma-dangle": ["error", "never"],
    "eol-last": "error",
    "indent": ["error", 2, { SwitchCase: 1 }],
    "keyword-spacing": ["error", { before: true, after: true }],
    "no-console": "error",
    "no-multiple-empty-lines": ["error", { max: 1 }],
    "no-shadow": "error",
    "no-trailing-spaces": "error",
    "no-unused-vars": "off",
    "operator-linebreak": ["error", "before"],
    "quotes": ["error", "double"],
    "semi": ["error", "always"]
  },
  overrides: [
    {
      files: [
        "*.ts",
        "*.tsx"
      ],
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "plugin:@typescript-eslint/strict"
      ],
      rules: {
        "@typescript-eslint/consistent-indexed-object-style": ["error", "index-signature"],
        "@typescript-eslint/consistent-type-imports": ["error", { prefer: "type-imports" }],
        "@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true }],
        "@typescript-eslint/indent": ["error", 2, { SwitchCase: 1 }],
        "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],
        "@typescript-eslint/no-shadow": "error",
        "@typescript-eslint/no-unnecessary-condition": ["error", { allowConstantLoopConditions: true }],
        "@typescript-eslint/no-unused-vars": ["error", { ignoreRestSiblings: true }],
        "@typescript-eslint/switch-exhaustiveness-check": "error",
        "indent": "off",
        "no-shadow": "off",
        "no-unused-vars": "off"
      }
    },
    {
      files: [
        "*.cjs"
      ],
      env: {
        node: true
      }
    },
    {
      files: [
        ".*rc.js",
        "*.config.js",
        "config/**/*.js"
      ],
      env: {
        browser: false,
        node: true
      },
      rules: {
        "no-console": "off"
      }
    }
  ]
};
