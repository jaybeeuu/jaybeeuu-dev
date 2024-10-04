import { defineConfig } from "cypress";
import coverage from "@cypress/code-coverage/task";

export default defineConfig({
  e2e: {
    baseUrl: "https://localhost:3443",
    specPattern: "integration/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "./support/e2e.ts",
    setupNodeEvents(on, config) {
      coverage(on, config);
      return config;
    },
  },
  env: {
    coverage: false,
  },
  experimentalFetchPolyfill: true,
  fixturesFolder: "fixtures",
  screenshotsFolder: ".screenshots",
  video: true,
  videosFolder: ".videos",
  reporter: "mocha-junit-reporter",
  reporterOptions: {
    mochaFile: "./.reports/[suiteFilename].xml",
  },
});
