// @ts-check
import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
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
