import { registerRoutes, getPostsAlias } from "../features/routes/posts";
import * as sideBar from "../features/side-bar";

context("Post navigation", (): void => {
  before(() => {
    registerRoutes();
    cy.visit("/");
    cy.wait(getPostsAlias("manifest"));
  });

  it("has a sidebar.", () => {
    sideBar.get().should("exist");
  });

  it("displays the posts in the manifest.", (): void => {
    sideBar.hasLinkToPost("memoising-selectors");
    sideBar.hasLinkToPost("module-spotting");
    sideBar.hasLinkToPost("the-rewrite");
  });
});
