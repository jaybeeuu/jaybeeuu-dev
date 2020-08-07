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
  cy.route("/posts/memoising-selectors-dKLBfn.html", "fixture:posts/memoising-selectors-dKLBfn.html").as(getALiasName(PostRoutes.GET_MEMOISING_SELECTORS));
  cy.route("/posts/module-spotting-EWltkX.html", "fixture:posts/module-spotting-EWltkX.html").as(getALiasName(PostRoutes.GET_MODULE_SPOTTING));
  cy.route("/posts/the-rewrite-qYixgS.html", "fixture:posts/the-rewrite-qYixgS.html").as(getALiasName(PostRoutes.GET_THE_REWRITE));
};
