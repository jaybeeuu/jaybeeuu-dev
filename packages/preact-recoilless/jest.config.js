// @ts-check

/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  clearMocks: true,
  preset: "ts-jest",
  transform: {
    "\\.(ts|tsx)$": "ts-jest",
    "\\.(mjs|js|jsx)$": "babel-jest",
  },
  testEnvironment: "jsdom",
  testMatch: ["**/*.spec.ts", "**/*.spec.tsx"],
  testPathIgnorePatterns: ["/node_modules/", "/lib/"],
  watchPathIgnorePatterns: ["<rootDir>/lib"],
  transformIgnorePatterns: [
    "/node_modules/(?!(\\.pnpm|@testing-library/preact|preact/))",
  ],
  moduleNameMapper: {
    "(\\.\\.?/.*)\\.js$": "$1",
  },
};

export default config;
