module.exports = {
  clearMocks: true,
  collectCoverageFrom: [
    "src/**/*.ts",
    "src/**/*.tsx",
    "!**/*.d.ts"
  ],
  testEnvironment: "jsdom",
  testMatch: [
    "**/*.spec.ts"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ]
};
