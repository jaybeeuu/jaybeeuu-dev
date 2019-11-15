module.exports = {
  clearMocks: true,
  testEnvironment: "node",
  rootDir: "..",
  preset: "ts-jest",
  testMatch: [
    "**/*.spec.ts"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ]
};
