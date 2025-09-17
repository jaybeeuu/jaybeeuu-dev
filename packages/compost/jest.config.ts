// @ts-check
import type { Config } from "jest";

const config: Config = {
  clearMocks: true,
  testEnvironment: "node",
  transform: {
    "^.+\\.(t|j)sx?$": "ts-jest",
  },
  transformIgnorePatterns: ["/node_modules/(?!(\\.pnpm|marked/))"],
  testMatch: ["**/*.spec.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/lib/"],
  watchPathIgnorePatterns: ["<rootDir>/.fs/", "<rootDir>/lib/"],
  moduleNameMapper: {
    "node-fetch": "<rootDir>/test/mocks/node-fetch.ts",
    "(\\.\\.?/.*)\\.js$": "$1",
  },
};

export default config;
