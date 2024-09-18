import type { ESLint } from "eslint";

declare module "eslint-plugin-cypress" {
  declare const cypress: ESLint.Plugin;
  export default cypress;
}
