// @ts-check
import {
  base,
  browser,
  config,
  ignoreFromGitIgnore,
  node,
} from "@jaybeeuu/eslint-config";
import cypress from "eslint-plugin-cypress";

/** @type {import("eslint").Linter.Config[]} */
export default config(
  ...base,
  ignoreFromGitIgnore(import.meta.url),
  browser,
  {
    plugins: { cypress },
    rules: {
      "cypress/no-assigning-return-values": "error",
      "cypress/no-unnecessary-waiting": "error",
      "cypress/assertion-before-screenshot": "error",
      "cypress/no-force": "error",
      "cypress/no-async-tests": "error",
    },
  },
  {
    files: ["plugins/**/*", "fixtures/**/*"],
    ...node,
  },
);
