import * as post from "../features/post";
import * as postList from "../features/post-list";
import {
  getPostsAlias,
  registerEmptyRoutes,
  registerRoutes
} from "../routes/blog";

context("Empty Post List", () => {
  beforeEach(() => {
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
  beforeEach(() => {
    cy.visit("/");
    registerRoutes();
  });

  it("the post list link in the nav bar opens a list of the posts.", () => {
    postList.openList();
    postList.get().should("be.visible");
  });

  it("displays the posts in the manifest.", (): void => {
    postList.openList();
    postList.hasLinkToPost("memoising-selectors");
    postList.hasLinkToPost("module-spotting");
    postList.hasLinkToPost("the-rewrite");
  });

  it("sorts the posts in ascending age order.", (): void => {
    postList.openList();
    postList.getPostLinkSlugs().then((slugs) => {
      expect(slugs).to.deep.equal([
        "the-rewrite",
        "module-spotting",
        "memoising-selectors"
      ]);
    });
  });

  it("shows the title of the memoising-selectors post when the link is clicked.", () => {
    postList.openPost("memoising-selectors");
    post.getArticle().should("contain.post.title", "memoising-selectors");
  });

  it("shows the title of the module-spotting post when the link is clicked.", () => {
    postList.openPost("module-spotting");
    post.getArticle().should("contain.post.title", "module-spotting");
  });

  it("shows the title of the module-spotting post when the link is clicked.", () => {
    postList.openPost("the-rewrite");
    post.getArticle().should("contain.post.title", "the-rewrite");
  });
});
