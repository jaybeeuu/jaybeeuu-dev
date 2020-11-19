module.exports = {
  clearMocks: true,
  collectCoverageFrom: [
    "src/**/*",
    "!**/*.d.ts",
  ],
  // preset: "ts-jest",
  transform: {
    "\\.[jt]sx?$": "ts-jest"
  },
  transformIgnorePatterns: [],
  testEnvironment: "node",
  testMatch: [
    "**/*.spec.ts",
    "**/*.spec.tsx"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/lib/"
  ],
  watchPathIgnorePatterns: [
    "<rootDir>/lib"
  ]
};
