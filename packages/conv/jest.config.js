// @ts-check

/** @type {import('jest').Config} */
const config = {
  clearMocks: true,
  testEnvironment: "node",
  transform: {
    "^.+\\.(t|j)sx?$": "ts-jest",
  },
  testMatch: ["**/*.spec.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/lib/"],
  moduleNameMapper: {
    "(\\.\\.?/.*)\\.js$": "$1",
  },
};

export default config;
