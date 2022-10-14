const config = {
  clearMocks: true,
  testEnvironment: "jsdom",
  setupFiles: [
    "./test/setup-jest.js"
  ],
  collectCoverageFrom : [
    "src/**"
  ],
  transform: {
    "^.+\\.(t|j)sx?$": ["ts-jest"]
  },
  testMatch: [
    "**/*.spec.ts"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/lib/"
  ],
  moduleNameMapper: {
    "(\\.\\.?/.*)\\.js$": "$1",
    "(\\.\\.?/.*)\\.css$": "<rootDir>/test/mock/css.js",
    "(\\.\\.?/.*)\\.(jpg|png)$": "<rootDir>/test/mock/file.js",
    "^preact$": "<rootDir>/node_modules/preact/dist/preact.js",
    "^preact/test-utils$": "<rootDir>/node_modules/preact/test-utils/dist/testUtils.js",
    "^preact/([a-z-]*)$": "<rootDir>/node_modules/preact/$1/dist/$1.js",
    "^preact-transitioning$": "<rootDir>/node_modules/preact-transitioning/lib/preact-transitioning.js"
  }
};

export default config;
