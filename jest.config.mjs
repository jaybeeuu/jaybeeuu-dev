const config = {
  projects: [
    "<rootDir>/packages/compost",
    "<rootDir>/packages/conv",
    "<rootDir>/packages/is",
    "<rootDir>/packages/preact-async",
    "<rootDir>/packages/preact-recoilless",
    "<rootDir>/packages/recoilless",
    "<rootDir>/packages/site",
    "<rootDir>/packages/utilities",
  ],
  collectCoverage: true,
  coverageDirectory: "./coverage-reports/unit",
  reporters: [
    "default",
    [
      "jest-junit",
      {
        suiteName: "Unit Tests",
        outputDirectory: "./test-reports",
        outputName: "unit.xml",
      },
    ],
  ],
};

export default config;
