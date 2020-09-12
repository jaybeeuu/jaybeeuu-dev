import { registerRoutes, getPostsAlias } from "../routes/posts";

context("Start up", (): void => {
  before(() => {
    registerRoutes();
    cy.visit("/");
    cy.wait(getPostsAlias("manifest"));
  });

  it("loads the home page", (): void => {
    cy.title().should("equal", "Josh Bickley-Wallace");
  });
});
