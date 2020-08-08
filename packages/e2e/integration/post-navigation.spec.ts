import { registerRoutes } from "../features/routes";
import * as sideBar from "../features/side-bar";

context("Post navigation", (): void => {
  before(() => {
    registerRoutes();
    cy.visit('/')
  });

  it("Has a sidebar", () => {
    sideBar.get().should("exist");
  });
});
