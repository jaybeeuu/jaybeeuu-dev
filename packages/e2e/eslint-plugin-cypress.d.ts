declare module "eslint-plugin-cypress" {
  import type { ESLint } from "eslint";
  const cypress: ESLint.Plugin;
  export default cypress;
}
