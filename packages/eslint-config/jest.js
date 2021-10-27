const jestRules = {
  "jest/prefer-expect-assertions": "off",
  "jest/valid-describe": "off",
  "jest/valid-title": ["error", { "ignoreTypeOfDescribeName": false }],
  "react/display-name": "off"
};

module.exports = {
  env: {
    es6: true
  },
  plugins: [
    "jest"
  ],
  overrides: [
    {
      files: [
        "test/**/*.ts",
        "test/**/*.tsx",
      ],
      extends: [
        "plugin:jest/all"
      ],
      rules: {
        ...jestRules,
        "jest/require-hook": "off",
      }
    },
    {
      files: [
        "**/*.spec.ts",
        "**/*.spec.tsx"
      ],
      extends: [
        "plugin:jest/all"
      ],
      rules: {
        ...jestRules
      }
    }
  ]
};
