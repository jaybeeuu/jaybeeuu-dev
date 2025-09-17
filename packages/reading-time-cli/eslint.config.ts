import type { Linter } from "eslint";
import {
  config,
  base,
  ignoreFromGitIgnore,
  node,
} from "@jaybeeuu/eslint-config";

const eslintConfig: Linter.Config[] = config(
  ...base,
  node,
  ignoreFromGitIgnore(import.meta.url),
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "no-console": ["off"],
    },
  },
);

export default eslintConfig;
