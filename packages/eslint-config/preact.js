// @ts-check
import reactPlugin from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export const preact = defineConfig({
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
