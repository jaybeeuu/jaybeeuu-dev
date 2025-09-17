import {
  base,
  config,
  ignoreFromGitIgnore,
  jest,
} from "@jaybeeuu/eslint-config";

export default config(...base, ...jest, ignoreFromGitIgnore(import.meta.url), {
  files: ["**/*.spec.ts", "**/*.spec.tsx"],
  rules: {
    "jest/require-hook": [
      "error",
      { allowedFunctionCalls: ["withFakeTimers"] },
    ],
  },
});
