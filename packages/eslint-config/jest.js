module.exports = {
  env: {
    es6: true
  },
  plugins: [
    "jest"
  ],
  extends: [
    "plugin:jest/all"
  ],
  rules: {
    "jest/prefer-expect-assertions": "off",
    "jest/valid-describe": "off",
    "jest/valid-title": ["error", { "ignoreTypeOfDescribeName": false }]
  },
  overrides: [
    {
      files: [
        "test/**/*.ts",
        "test/**/*.tsx",
        "**/*.spec.ts",
        "**/*.spec.tsx"
      ],
      rules: {
        "react/display-name": "off"
      }
    }
  ]
};
