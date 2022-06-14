import * as navBar from "../features/nav-bar";
import { registerRoutes } from "../routes/blog";

context("Start up", (): void => {
  it("loads the page.", () => {
    registerRoutes();
    cy.visit("/");
    cy.title().should("equal", "Josh Bickley-Wallace");
    navBar.get().should("exist");
  });
});
