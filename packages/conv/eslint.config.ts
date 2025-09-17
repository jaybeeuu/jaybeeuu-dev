import type { Linter } from "eslint";
import {
  config,
  base,
  node,
  ignoreFromGitIgnore,
} from "@jaybeeuu/eslint-config";

const eslintConfig: Linter.Config[] = config(
  ...base,
  ignoreFromGitIgnore(import.meta.url),
  node,
);

export default eslintConfig;
