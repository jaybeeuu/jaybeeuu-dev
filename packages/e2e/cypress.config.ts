import { defineConfig } from "cypress";
import * as coverageModule from "@cypress/code-coverage/task.js";

const coverage = coverageModule.default as unknown as (
  on: Cypress.PluginEvents,
  config: Cypress.PluginConfigOptions,
) => void;

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
  fixturesFolder: "fixtures",
  screenshotsFolder: ".screenshots",
  video: false,
  videosFolder: ".videos",
  reporter: "mocha-junit-reporter",
  reporterOptions: {
    mochaFile: "./.reports/[suiteFilename].xml",
  },
});
