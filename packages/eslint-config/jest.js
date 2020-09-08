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
  overrides: [
    {
      files: [
        "test/**/*.ts",
        "**/*.spec.ts"
      ],
      env: {
        "jest/globals": true
      },
      rules: {
        "jest/no-hooks": "off",
        "jest/prefer-expect-assertions": "off",
        "jest/valid-describe": "off",
        "jest/valid-title": ["error", { "ignoreTypeOfDescribeName": false }]
      }
    },
    {
      files: ["jest-setup.js"],
      env: {
        node: true
      },
      globals: {
        global: "writable"
      }
    }
  ]
};
