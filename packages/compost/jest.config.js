// @ts-check

/** @type {import('jest').Config} */
const config = {
  clearMocks: true,
  testEnvironment: "node",
  // collectCoverageFrom : [
  //   "./src/**",
  //   "!./src/bin/**"
  // ],
  transform: {
    "^.+\\.(t|j)sx?$": "ts-jest"
  },
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
    "node-fetch": "<rootDir>/test/mocks/node-fetch.ts",
    "(\\.\\.?/.*)\\.js$": "$1"
  }
};

export default config;
