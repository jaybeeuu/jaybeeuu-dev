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
