module.exports = {
  clearMocks: true,
  testEnvironment: "node",
  collectCoverage: true,
  collectCoverageFrom : [
    "src/**",
    "!src/bin/**"
  ],
  preset: "ts-jest",
  globals: {
    "ts-jest": {
      packageJson: "package.json",
    },
  },
  testMatch: [
    "**/*.spec.ts"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/lib/"
  ],
  watchPathIgnorePatterns: [
    "<rootDir>/fs",
    "<rootDir>/lib"
  ]
};
