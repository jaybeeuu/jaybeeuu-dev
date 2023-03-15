// @ts-check

/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  clearMocks: true,
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFiles: [
    "./test/setup-jest.js"
  ],
  // collectCoverageFrom : [
  //   "src/**"
  // ],
  transform: {
    "\\.(ts|tsx)$": "ts-jest",
    "\\.(mjs|js|jsx)$": "babel-jest"
  },
  testMatch: [
    "**/*.spec.ts"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/lib/"
  ],
  transformIgnorePatterns: [
    "node_modules/(?!(\\.pnpm|@testing-library/preact|preact/|preact-transitioning|preact-merge-refs))"
  ],
  moduleNameMapper: {
    "(\\.\\.?/.*)\\.js$": "$1",
    "(\\.\\.?/.*)\\.css$": "<rootDir>/test/mock/css.js",
    "(\\.\\.?/.*)\\.(jpg|png)$": "<rootDir>/test/mock/file.js"
  }
};

export default config;
