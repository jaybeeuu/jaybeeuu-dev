// @ts-check
import jestPlugin from "eslint-plugin-jest";
import globals from "globals";
import { defineConfig } from "eslint/config";

export const jest = defineConfig(
  {
    files: ["**/*.spec.ts", "**/*.spec.tsx"],
    extends: [jestPlugin.configs["flat/all"]],
    rules: {
      ...jestPlugin.configs["flat/all"].rules,
      "jest/prefer-expect-assertions": "off",
      "jest/prefer-lowercase-title": ["error", { ignore: ["describe"] }],
      "jest/valid-describe": "off",
      "jest/valid-title": ["error", { ignoreTypeOfDescribeName: false }],
      "react/display-name": "off",
    },
  },
  {
    files: ["test/**/*.js", "test/**/*.jsx", "test/**/*.ts", "test/**/*.tsx"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
);
