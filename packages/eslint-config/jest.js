// @ts-check
// @ts-expect-error there are no types for this library
import jestPlugin from "eslint-plugin-jest";
import globals from "globals";
import { config } from "typescript-eslint";

const jestRules = {
  ...jestPlugin.configs["flat/all"].rules,
  "jest/prefer-expect-assertions": "off",
  "jest/prefer-lowercase-title": ["error", { ignore: ["describe"] }],
  "jest/valid-describe": "off",
  "jest/valid-title": ["error", { ignoreTypeOfDescribeName: false }],
  "react/display-name": "off",
};

export const jest = config(
  {
    files: ["**/*.spec.ts", "**/*.spec.tsx"],
    extends: [jestPlugin.configs["flat/all"]],
    rules: { ...jestRules },
  },
  {
    files: ["test/**/*.js", "test/**/*.jsx", "test/**/*.ts", "test/**/*.tsx"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
);
