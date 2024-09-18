// @ts-check
import { base, config, ignoreFromGitIgnore, node } from "./index.js";

const conf = config(...base, ignoreFromGitIgnore(import.meta.url), node);

export default conf;
