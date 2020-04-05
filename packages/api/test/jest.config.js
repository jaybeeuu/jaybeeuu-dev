module.exports = {
  clearMocks: true,
  testEnvironment: "node",
  rootDir: "..",
  testMatch: [
    "**/*.spec.ts"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ],
  watchPathIgnorePatterns: [
    "<rootDir>/fs"
  ]
};
