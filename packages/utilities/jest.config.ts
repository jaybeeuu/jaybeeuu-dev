// @ts-check
import type { Config } from "jest";

const config: Config = {
  clearMocks: true,
  testEnvironment: "node",
  // collectCoverageFrom : [
  //   "src/**"
  // ],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      { tsconfig: "<rootDir>/tsconfig.test.json" },
    ],
  },
  testMatch: ["**/*.spec.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/lib/"],
  moduleNameMapper: {
    "(\\.\\.?/.*)\\.js$": "$1",
  },
};

export default config;
