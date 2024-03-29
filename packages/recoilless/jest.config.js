// @ts-check

/** @type {import('jest').Config} */
const config = {
  clearMocks: true,
  transform: {
    "^.+\\.(t|j)sx?$": "ts-jest",
  },
  testEnvironment: "node",
  testMatch: ["**/*.spec.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/lib/"],
  watchPathIgnorePatterns: ["<rootDir>/lib"],
  moduleNameMapper: {
    "(\\.\\.?/.*)\\.js$": "$1",
  },
};

export default config;
