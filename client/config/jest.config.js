module.exports = {
  clearMocks: true,
  testEnvironment: "jsdom",
  rootDir: "..",
  testMatch: [
    "**/*.spec.ts"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ]
};
