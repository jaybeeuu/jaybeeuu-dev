import * as fourOhFour from "../features/four-oh-four";
import * as postList from "../features/post-list";
import {
  getPostsAlias,
  registerEmptyRoutes,
  registerRoutes,
} from "../routes/blog";

context("Empty Post List", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("displays a message when there's no posts", () => {
    registerEmptyRoutes();
    postList.openList();
    cy.wait(getPostsAlias("manifest"));
    postList
      .get()
      .should("contain.text", "Nothing to see? Write some posts...");
  });
});

context("Four Oh Four", (): void => {
  beforeEach(() => {
    cy.visit("/");
    registerRoutes();
  });

  it("shows a 404 when navigating to a post which doesn't exist.", () => {
    cy.visit("/blog/not-a-post");
    fourOhFour.getRoot().should("be.visible");
  });

  it("shows a 404 when navigating to a file which doesn't exist.", () => {
    cy.visit("/not-a-file.md");
    fourOhFour.getRoot().should("be.visible");
  });

  it("shows a 404 when navigating to a route which doesn't exist.", () => {
    cy.visit("/no-a-route");
    fourOhFour.getRoot().should("be.visible");
  });
});
