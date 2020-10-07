import { registerRoutes, getPostsAlias } from "../routes/posts";
import * as navBar from "../features/nav-bar";
import * as post from "../features/post";

context("Post navigation", (): void => {
  beforeEach(() => {
    registerRoutes();
    cy.visit("/");
    cy.wait(getPostsAlias("manifest"));
  });

  it("has a nav bar.", () => {
    navBar.get().should("exist");
  });

  it("displays the posts in the manifest.", (): void => {
    navBar.hasLinkToPost("memoising-selectors");
    navBar.hasLinkToPost("module-spotting");
    navBar.hasLinkToPost("the-rewrite");
  });

  it("opens the memoising-selectors post when the link is clicked.", () => {
    navBar.openPost("memoising-selectors");
    post.getArticle().should("contain.post", "memoising-selectors");
  });

  it("opens the module-spotting post when the link is clicked.", () => {
    navBar.openPost("module-spotting");
    post.getArticle().should("contain.post", "module-spotting");
  });

  it("opens the the-rewrite post when navigated to directly.", () => {
    post.navigateTo("the-rewrite");
    post.getArticle().should("contain.post", "the-rewrite");
  });
});
