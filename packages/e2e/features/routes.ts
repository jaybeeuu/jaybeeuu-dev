import * as manifest from "../fixtures/posts/manifest.json";

export enum PostRoutes {
  GET_MANIFEST = "@get_manifest",
  GET_MEMOISING_SELECTORS = "@get_memoising_selectors",
  GET_MODULE_SPOTTING = "@get_module_spotting",
  GET_THE_REWRITE = "@get_the_rewrite",
}
const getALiasName = (alias: string): string => alias.replace(/^@/, "");

export const registerRoutes = (): void => {
  cy.server();

  cy.route("/posts/manifest.json", "fixture:posts/manifest.json").as(getALiasName(PostRoutes.GET_MANIFEST));
  cy.route(`/posts/${manifest["memoising-selectors"].fileName}`, `fixture:posts/${manifest["memoising-selectors"].fileName}`).as(getALiasName(PostRoutes.GET_MEMOISING_SELECTORS));
  cy.route(`/posts/${manifest["module-spotting"].fileName}`, `fixture:posts/${manifest["module-spotting"].fileName}`).as(getALiasName(PostRoutes.GET_MODULE_SPOTTING));
  cy.route(`/posts/${manifest["the-rewrite"].fileName}`, `fixture:posts/${manifest["the-rewrite"].fileName}`).as(getALiasName(PostRoutes.GET_THE_REWRITE));
};
