const path = require("path");

const makeTranformIgnorePatterns = () => {
  const patternSeperator = path.sep === "\\" ? "\\\\" : "/";

  return [
    ["node_modules", "(?!(@bickley-wallace))"].join(patternSeperator)
  ];
};

module.exports = {
  clearMocks: true,
  collectCoverageFrom: [
    "src/**/*",
    "!**/*.d.ts",
  ],
  // preset: "ts-jest",
  transform: {
    "\\.[jt]sx?$": "ts-jest"
  },
  transformIgnorePatterns: makeTranformIgnorePatterns(),
  testEnvironment: "node",
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
  ]
};
