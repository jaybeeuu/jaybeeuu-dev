// @ts-check
import {
  config,
  base,
  ignoreFromGitIgnore,
  node,
} from "@jaybeeuu/eslint-config";

/** @type {import("eslint").Linter.Config[]} */
export default config(...base, node, ignoreFromGitIgnore(import.meta.url), {
  files: ["**/*.ts", "**/*.tsx"],
  rules: {
    "no-console": ["off"],
  },
});
