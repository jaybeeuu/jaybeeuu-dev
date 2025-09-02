// @ts-check
import reactPlugin from "eslint-plugin-react";
import tseslint from "typescript-eslint";

export const preact = tseslint.config({
  extends: reactPlugin.configs.flat.recommended && [
    reactPlugin.configs.flat.recommended,
  ],
  files: ["**/*.tsx"],
  languageOptions: {
    parserOptions: {
      ecmaFeatures: {
        jsx: true,
      },
      jsxPragma: "h",
      version: "detect",
    },
  },
  settings: {
    react: {
      pragma: "h",
      version: "detect",
    },
  },
  rules: { "react/prop-types": "off" },
});
