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
  rules: {
    "eol-last": ["error"],
    "indent": ["error", 2, { SwitchCase: 1 }],
    "no-console": ["error"],
    "no-shadow": ["error"],
    "no-trailing-spaces": "error",
    "no-unused-vars": ["off"],
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
      parser: "@typescript-eslint/parser",
      parserOptions: {
        project: "./tsconfig.json",
        sourceType: "module"
      },
      extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking"
      ],
      rules: {
        "@typescript-eslint/explicit-function-return-type": ["error", { allowExpressions: true }],
        "indent": "off",
        "@typescript-eslint/indent": ["error", 2, { SwitchCase: 1 }],
        "@typescript-eslint/no-misused-promises": ["error", { checksVoidReturn: false }],
        "@typescript-eslint/no-unused-vars": ["error", { ignoreRestSiblings: true }],
        "@typescript-eslint/switch-exhaustiveness-check": "error",
        "no-unused-vars": ["off"]
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
      parserOptions: {
        ecmaVersion: 2018
      },
      rules: {
        "no-console": "off"
      }
    }
  ]
};
