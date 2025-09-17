import {
  base,
  browser,
  config,
  ignoreFromGitIgnore,
  jest,
  preact,
} from "@jaybeeuu/eslint-config";

export default config(
  ...base,
  browser,
  ...jest,
  ...preact,
  ignoreFromGitIgnore(import.meta.url),
);
