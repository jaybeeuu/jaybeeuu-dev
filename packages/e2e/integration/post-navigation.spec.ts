import { registerRoutes, PostRoutes } from "../features/routes";
import * as sideBar from "../features/side-bar";

context("Post navigation", (): void => {
  before(() => {
    registerRoutes();
    cy.visit("/");
    cy.wait(PostRoutes.GET_MANIFEST);
  });

  it("Has a sidebar", () => {
    sideBar.get().should("exist");
  });

  it("pings the API successfully", (): void => {
    sideBar.getGreeting().should("have.text", "Hello, Side Bar!");
    sideBar.getApiResults().should("contain.text", "\"status\": \"complete\"");
  });
});
