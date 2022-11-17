const config = {
  clearMocks: true,
  collectCoverageFrom: [
    "src/**/*",
    "!**/*.d.ts"
  ],
  transform: {
    "^.+\\.(t|j)sx?$": ["ts-jest"]
  },
  testEnvironment: "jsdom",
  testMatch: [
    "**/*.spec.ts",
    "**/*.spec.tsx"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/lib/"
  ],
  watchPathIgnorePatterns: [
    "<rootDir>/lib"
  ],
  moduleNameMapper: {
    "(\\.\\.?/.*)\\.js$": "$1",
    "^preact$": "<rootDir>/node_modules/preact/dist/preact.js",
    "^preact/test-utils$": "<rootDir>/node_modules/preact/test-utils/dist/testUtils.js",
    "^preact/([a-z-]*)$": "<rootDir>/node_modules/preact/$1/dist/$1.js"
  }
};
export default config;
