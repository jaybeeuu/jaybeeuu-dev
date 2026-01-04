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
  {
    files: ["src/**/*.tsx"],
    rules: {
      // Use React's jsx-pascal-case rule for component naming instead of overriding function naming
      "react/jsx-pascal-case": [
        "error",
        { allowAllCaps: false, allowLeadingUnderscore: false },
      ],
      // Override naming convention to allow PascalCase for React component variables
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "variable",
          format: ["camelCase", "PascalCase"],
          leadingUnderscore: "forbid",
          trailingUnderscore: "forbid",
        },
        {
          selector: "function",
          format: ["camelCase"],
          leadingUnderscore: "forbid",
          trailingUnderscore: "forbid",
        },
      ],
    },
  },
);

export default eslintConfig;
