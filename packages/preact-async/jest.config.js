module.exports = {
  clearMocks: true,
  collectCoverageFrom: [
    "src/**/*",
    "!**/*.d.ts"
  ],
  transform: {
    "^.+\\.(t|j)sx?$": ["ts-jest"]
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
