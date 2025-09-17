import type { Linter } from "eslint";
import {
  config,
  base,
  ignoreFromGitIgnore,
  node,
} from "@jaybeeuu/eslint-config";

export default config(...base, node, ignoreFromGitIgnore(import.meta.url), {
  files: ["**/*.ts", "**/*.tsx"],
}) as Linter.Config[];
