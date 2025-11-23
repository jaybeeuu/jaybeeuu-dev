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
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "default",
          format: ["camelCase"],
          leadingUnderscore: "forbid",
          trailingUnderscore: "forbid",
        },
        {
          selector: "import",
          format: ["camelCase"],
        },
        {
          selector: "variable",
          format: ["camelCase", "PascalCase"],
          leadingUnderscore: "forbid",
          trailingUnderscore: "forbid",
        },
        {
          selector: "function",
          format: ["camelCase", "PascalCase"],
        },
        {
          selector: "typeLike",
          format: ["PascalCase"],
        },
        {
          selector: "typeParameter",
          format: ["StrictPascalCase"],
          custom: {
            regex: "^[A-Z][a-zA-Z]{2,}$",
            match: true,
          },
        },
        {
          selector: "property",
          format: null,
        },
        {
          selector: "objectLiteralProperty",
          format: null,
        },
      ],
    },
  },
);

export default eslintConfig;
