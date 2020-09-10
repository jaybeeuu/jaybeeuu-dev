import { registerRoutes, getPostsAlias } from "../routes/posts";
import * as sideBar from "../features/side-bar";
import * as post from "../features/post";

context("Post navigation", (): void => {
  beforeEach(() => {
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

  it("opens the memoising-selectors post when the link is clicked.", () => {
    sideBar.openPost("memoising-selectors");
    post.getArticle().should("contain.text", "thing");
  });
});
