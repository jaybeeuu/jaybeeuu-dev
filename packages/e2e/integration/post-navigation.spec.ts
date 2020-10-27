import { registerRoutes, getPostsAlias } from "../routes/posts";
import * as navBar from "../features/nav-bar";
import * as post from "../features/post";
import * as postList from "../features/post-list";

context("Post navigation", (): void => {
  before(() => {
    cy.visit("/");
  });

  beforeEach(() => {
    registerRoutes();
  });

  it("the post list link in the nav bar opens a list of the posts.", () => {
    navBar.getPostListLink().click();
    cy.wait(getPostsAlias("manifest"));
    postList.get().should("be.visible");
  });

  it("displays the posts in the manifest.", (): void => {
    postList.hasLinkToPost("memoising-selectors");
    postList.hasLinkToPost("module-spotting");
    postList.hasLinkToPost("the-rewrite");
  });

  it("opens the memoising-selectors post when the link is clicked.", () => {
    postList.openPost("memoising-selectors");
    post.getArticle().should("contain.post.paragraphs", "memoising-selectors");
  });

  it("the title of the memoising-selectors post when the link is clicked.", () => {
    postList.openPost("memoising-selectors");
    post.getArticle().should("contain.post.title", "memoising-selectors");
  });

  it("opens the module-spotting post when the link is clicked.", () => {
    postList.openPost("module-spotting");
    post.getArticle().should("contain.post.paragraphs", "module-spotting");
  });

  it("opens the the-rewrite post when navigated to directly.", () => {
    post.navigateTo("the-rewrite");
    post.getArticle().should("contain.post.paragraphs", "the-rewrite");
  });
});
