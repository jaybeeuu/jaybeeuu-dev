import type { Linter } from "eslint";
import { config, base, ignoreFromGitIgnore } from "@jaybeeuu/eslint-config";

const eslintConfig: Linter.Config[] = config(
  ...base,
  ignoreFromGitIgnore(import.meta.url),
);

export default eslintConfig;
