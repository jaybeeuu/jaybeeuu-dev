import { config, base, ignoreFromGitIgnore } from "@jaybeeuu/eslint-config";

export default config(...base, ignoreFromGitIgnore(import.meta.url));
