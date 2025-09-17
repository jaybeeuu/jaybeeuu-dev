import type { Linter } from "eslint";
import {
  base,
  browser,
  config,
  ignoreFromGitIgnore,
  jest,
  preact,
} from "@jaybeeuu/eslint-config";

const eslintConfig: Linter.Config[] = config(
  ...base,
  browser,
  ...jest,
  ...preact,
  ignoreFromGitIgnore(import.meta.url),
);

export default eslintConfig;
