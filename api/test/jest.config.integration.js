const baseconfig = require("./jest.config");

module.exports = {
  ...baseconfig,
  testMatch: [
    "**/integration/*.spec.ts"
  ],
  testPathIgnorePatterns: [
    "/node_modules/",
    "/dist/"
  ]
};