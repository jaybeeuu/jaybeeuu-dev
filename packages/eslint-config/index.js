// @ts-check
import { includeIgnoreFile } from "@eslint/compat";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
export { defineConfig as config } from "eslint/config";
export { base } from "./base.js";
export { browser, node } from "./env.js";
export { jest } from "./jest.js";
export { preact } from "./preact.js";
export { globals };

/**
 * @param {string} importMetaUrl
 * @returns {import("eslint").Linter.Config}
 */
export const ignoreFromGitIgnore = (importMetaUrl) => {
  const __filename = fileURLToPath(importMetaUrl);
  const __dirname = path.dirname(__filename);
  const gitignorePath = path.resolve(__dirname, ".gitignore");

  return includeIgnoreFile(gitignorePath);
};
