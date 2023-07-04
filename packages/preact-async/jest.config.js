// @ts-check

/** @type {import('ts-jest').JestConfigWithTsJest} */
const config = {
  clearMocks: true,
  preset: "ts-jest",
  moduleNameMapper: {
    "(\\.\\.?/.*)\\.js$": "$1"
  },
  setupFilesAfterEnv: ["<rootDir>/jest-setup.ts"],
  testEnvironment: "jsdom",
  testMatch: [
    "**/*.spec.ts",
    "**/*.spec.tsx"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/lib/"
  ],
  transform: {
    "\\.(ts|tsx)$": "ts-jest",
    "\\.(mjs|js|jsx)$": "babel-jest"
  },
  transformIgnorePatterns: [
    "/node_modules/(?!(\\.pnpm|@testing-library/preact|preact/))"
  ],
  watchPathIgnorePatterns: [
    "<rootDir>/lib"
  ]
};

export default config;
