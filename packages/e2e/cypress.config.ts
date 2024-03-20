import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "https://localhost:3443",
    specPattern: "integration/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: false,
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
