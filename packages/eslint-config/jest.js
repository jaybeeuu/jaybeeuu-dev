const jestRules = {
  "jest/prefer-expect-assertions": "off",
  "jest/valid-describe": "off",
  "jest/valid-title": ["error", { "ignoreTypeOfDescribeName": false }],
  "react/display-name": "off"
};

module.exports = {
  plugins: [
    "jest"
  ],
  overrides: [
    {
      files: [
        "test/**/*.js",
        "test/**/*.jsx",
        "test/**/*.ts",
        "test/**/*.tsx"
      ],
      extends: [
        "plugin:jest/all"
      ],
      rules: {
        ...jestRules,
        "jest/require-hook": "off"
      },
      env: {
        node: true,
        "jest/globals": true
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
