const config = {
  clearMocks: true,
  testEnvironment: "node",
  collectCoverageFrom : [
    "src/**",
    "!src/bin/**"
  ],
  preset: "ts-jest",
  testMatch: [
    "**/*.spec.ts"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/lib/"
  ],
  watchPathIgnorePatterns: [
    "<rootDir>/.fs/",
    "<rootDir>/lib/"
  ],
  moduleNameMapper: {
    "(\\.\\.?/.*)\\.js$": "$1"
  },
};

export default config;
