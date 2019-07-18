module.exports = {
  verbose: false,
  collectCoverage: false,
  collectCoverageFrom: [
    "src/**/*.{js,jsx}"
  ],
  setupTestFrameworkScriptFile: "<rootDir>/test/setup-enzyme",
  moduleFileExtensions: [
    "js",
    "json",
    "jsx"
  ],
  resetMocks: true,
  testEnvironment: "jsdom",
  testMatch: [
    "<rootDir>/(src|spec)/**/?(*.)([Ss]pec|[Tt]est).{js,jsx}"
  ],
  testURL: "http://localhost",
  transform: {
    "^.+\\.(js|jsx)$": "<rootDir>/node_modules/babel-jest",
    "^.+\\.css$": "<rootDir>/config/jest/css-transform.js",
    "^(?!.*\\.(js|jsx|css|json)$)": "<rootDir>/config/jest/file-transform.js"
  },
  transformIgnorePatterns: [
    "[/\\\\]node_modules[/\\\\].+\\.(js|jsx)$"
  ]
};