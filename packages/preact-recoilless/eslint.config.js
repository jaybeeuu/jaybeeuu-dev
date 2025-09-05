// @ts-check
import {
  base,
  browser,
  config,
  ignoreFromGitIgnore,
  jest,
  preact,
} from "@jaybeeuu/eslint-config";

/** @type {import("eslint").Linter.Config[]} */
export default config(
  ...base,
  browser,
  ...jest,
  ...preact,
  ignoreFromGitIgnore(import.meta.url),
);
