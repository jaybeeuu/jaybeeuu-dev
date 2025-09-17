import type { Linter } from "eslint";
import {
  base,
  config,
  ignoreFromGitIgnore,
  jest,
} from "@jaybeeuu/eslint-config";

const eslintConfig: Linter.Config[] = config(
  ...base,
  ...jest,
  ignoreFromGitIgnore(import.meta.url),
  {
    files: ["**/*.spec.ts", "**/*.spec.tsx"],
    rules: {
      "jest/require-hook": [
        "error",
        { allowedFunctionCalls: ["withFakeTimers"] },
      ],
    },
  },
);

export default eslintConfig;
