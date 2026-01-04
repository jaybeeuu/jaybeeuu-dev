import * as navBar from "../features/nav-bar.js";
import { registerRoutes } from "../routes/blog.js";

context("Start up", (): void => {
  it("loads the page.", () => {
    registerRoutes();
    cy.visit("/");
    cy.title().should("equal", "Josh Bickley-Wallace");
    navBar.get().should("exist");
  });
});
