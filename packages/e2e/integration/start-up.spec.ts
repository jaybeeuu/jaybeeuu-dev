import { registerRoutes, getPostsAlias } from "../features/routes/posts";

context("Start up", (): void => {
  before(() => {
    registerRoutes();
    cy.visit("/");
    cy.wait(getPostsAlias("manifest"));
  });

  it("loads", (): void => {
    cy.title().should("equal", "Josh Bickley-Wallace");
  });
});
