import type { Linter } from "eslint";
import { base, config, ignoreFromGitIgnore, node } from "./index.js";

const conf = config(
  ...base,
  ignoreFromGitIgnore(import.meta.url),
  node,
) as Linter.Config[];

export default conf;
