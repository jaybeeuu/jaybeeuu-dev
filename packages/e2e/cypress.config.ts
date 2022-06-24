import { defineConfig } from "cypress";

export default defineConfig({
  experimentalFetchPolyfill: true,
  fixturesFolder: "fixtures",
  screenshotsFolder: ".screenshots",
  video: true,
  videosFolder: ".videos",
  e2e: {
    baseUrl: "https://localhost:3443",
    specPattern: "integration/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: false
  }
});
