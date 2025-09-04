import {
  config,
  base,
  node,
  ignoreFromGitIgnore,
} from "@jaybeeuu/eslint-config";

/** @type {import("eslint").Linter.Config[]} */
export default config(...base, ignoreFromGitIgnore(import.meta.url), node);
