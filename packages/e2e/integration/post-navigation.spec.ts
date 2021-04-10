import {
  getPostsAlias,
  registerEmptyRoutes,
  registerRoutes,
  withPostMetaData
} from "../routes/posts";
import * as navBar from "../features/nav-bar";
import * as post from "../features/post";
import * as postList from "../features/post-list";

context("Empty Post List", () => {
  before(() => {
    cy.visit("/");
  });

  it("displays a message when there's no posts", () => {
    registerEmptyRoutes();
    postList.openList();
    cy.wait(getPostsAlias("manifest"));
    postList.get().should("contain.text", "Nothing to see? Write some posts...");
  });
});

context("Post navigation", (): void => {
  before(() => {
    cy.visit("/");
  });

  beforeEach(() => {
    registerRoutes();
  });

  it("the post list link in the nav bar opens a list of the posts.", () => {
    navBar.getHomeLink().click();
    postList.openList();
    cy.wait(getPostsAlias("manifest"));
    postList.get().should("be.visible");
  });

  it("displays the posts in the manifest.", (): void => {
    postList.hasLinkToPost("memoising-selectors");
    postList.hasLinkToPost("module-spotting");
    postList.hasLinkToPost("the-rewrite");
  });

  it("shows the paragraphs of the memoising-selectors post when the link is clicked.", () => {
    postList.openPost("memoising-selectors");
    post.getArticle().should("contain.post.paragraphs", "memoising-selectors");
  });

  it("shows the title of the memoising-selectors post when the link is clicked.", () => {
    postList.openPost("memoising-selectors");
    post.getArticle().should("contain.post.title", "memoising-selectors");
  });

  it("shows the paragraphs of the module-spotting post when the link is clicked.", () => {
    postList.openPost("module-spotting");
    post.getArticle().should("contain.post.paragraphs", "module-spotting");
  });

  it("shows the title of the module-spotting post when the link is clicked.", () => {
    postList.openPost("module-spotting");
    post.getArticle().should("contain.post.title", "module-spotting");
  });

  it("shows the paragraphs of the the-rewrite post when navigated to directly.", () => {
    post.navigateTo("the-rewrite");
    post.getArticle().should("contain.post.paragraphs", "the-rewrite");
  });

  it("shows the title of the the-rewrite post when navigated to directly.", () => {
    post.navigateTo("the-rewrite");
    post.getArticle().should("contain.post.title", "the-rewrite");
  });

  it("Sets the page title to the title of the the-rewrite post when the link is clicked.", () => {
    postList.openPost("the-rewrite");
    withPostMetaData("the-rewrite").then((meta) => {
      cy.title().should("contain", meta.title);
    });
  });

  it("switches back to the post list when the link is clicked after opening a post.", () => {
    post.navigateTo("the-rewrite");
    navBar.getPostListLink().click();
    postList.get().should("be.visible");
  });

  it("scrolls to an anchor when loading a page from scratch with a hash.", () => {
    postList.openPost("module-spotting");
    post.navigateToAnchor("module-spotting", "commonjs");
    post.getAnchorDestination("commonjs").should("be.visible");
  });

  it("scrolls to an anchor when clicking an inline link with a hash.", () => {
    postList.openPost("module-spotting");
    post.getInlineLink("CommonJS").click();
    post.getAnchorDestination("commonjs").should("be.visible");
  });
});
