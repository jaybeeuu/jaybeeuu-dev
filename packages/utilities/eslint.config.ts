import type { Linter } from "eslint";
import { config, base, ignoreFromGitIgnore } from "@jaybeeuu/eslint-config";

export default config(
  ...base,
  ignoreFromGitIgnore(import.meta.url),
) as Linter.Config[];
