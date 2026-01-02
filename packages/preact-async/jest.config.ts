// @ts-check
import type { Config } from "jest";

const config: Config = {
  clearMocks: true,
  preset: "ts-jest",
  testEnvironment: "jsdom",
  transform: {
    "\\.(ts|tsx)$": ["ts-jest", { tsconfig: "<rootDir>/tsconfig.test.json" }],
    "\\.(mjs|js|jsx)$": "babel-jest",
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(\\.pnpm|@testing-library/preact|preact/))",
  ],
  moduleNameMapper: {
    "(\\.\\.?/.*)\\.js$": "$1",
  },
  testMatch: ["**/*.spec.ts", "**/*.spec.tsx"],
  testPathIgnorePatterns: ["/node_modules/", "/lib/"],
  watchPathIgnorePatterns: ["<rootDir>/lib"],
  setupFilesAfterEnv: ["<rootDir>/jest-setup.ts"],
};

export default config;
