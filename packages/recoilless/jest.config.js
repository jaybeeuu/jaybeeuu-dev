module.exports = {
  clearMocks: true,
  collectCoverageFrom: [
    "src/**/*",
    "!**/*.d.ts"
  ],
  preset: "ts-jest",
  globals: {
    "ts-jest": {
      packageJson: "package.json",
    },
  },
  testEnvironment: "node",
  testMatch: [
    "**/*.spec.ts"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/lib/"
  ],
  watchPathIgnorePatterns: [
    "<rootDir>/lib"
  ]
};
