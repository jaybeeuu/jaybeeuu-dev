// @ts-check
import type { JestConfigWithTsJest } from "ts-jest";

const config: JestConfigWithTsJest = {
  clearMocks: true,
  preset: "ts-jest",
  testEnvironment: "jsdom",
  setupFiles: ["./test/setup-jest.js"],
  // collectCoverageFrom : [
  //   "src/**"
  // ],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      { tsconfig: "<rootDir>/tsconfig.test.json" },
    ],
    "\\.(mjs|js|jsx)$": "babel-jest",
  },
  testMatch: ["**/*.spec.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/lib/"],
  transformIgnorePatterns: [
    "node_modules/(?!(\\.pnpm|@testing-library/preact|preact/|preact-transitioning|preact-merge-refs|@jaybeeuu/posts|node-fetch|fetch-blob|data-uri-to-buffer|formdata-polyfill|marked))",
  ],
  moduleNameMapper: {
    "(\\.\\.?/.*)\\.js$": "$1",
    "(\\.\\.?/.*)\\.css$": "<rootDir>/test/mock/css.js",
    "(\\.\\.?/.*)\\.(jpg|png)$": "<rootDir>/test/mock/file.js",
  },
};

export default config;
