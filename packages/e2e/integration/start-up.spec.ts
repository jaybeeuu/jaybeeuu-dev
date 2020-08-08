import { registerRoutes, PostRoutes } from "../features/routes";

context("POC", (): void => {
  before(() => {
    registerRoutes();
    cy.visit("/");
    cy.wait(PostRoutes.GET_MANIFEST);
  });

  it("loads", (): void => {
    cy.title().should('equal', "Josh Bickley-Wallace");
  });
});
