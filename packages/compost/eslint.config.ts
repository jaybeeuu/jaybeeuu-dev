import type { Linter } from "eslint";
import {
  config,
  base,
  node,
  ignoreFromGitIgnore,
} from "@jaybeeuu/eslint-config";

export default config([
  ...base,
  ignoreFromGitIgnore(import.meta.url),
  node,
]) as Linter.Config[];
