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
    sideBar.getPostLink("memoising-selectors")
      .should("have.text", "Memoising Selectors");
    sideBar.getPostAbstract("memoising-selectors")
      .should("contain.text", "Complex operations in redux selectors can result in render thrashing, but why and how does it happen?");
  });
});
