import { registerRoutes, withPostMetaData } from "../routes/posts";
import * as postList from "../features/post-list";
import * as post from "../features/post";

context("Post navigation", (): void => {
  before(() => {
    cy.visit("/");
  });

  beforeEach(() => {
    registerRoutes();
  });

  describe("Title", () => {
    it("Sets the title appropriately on the post list page.", () => {
      postList.openList();
      cy.title().should("contain", "Blog posts");
    });

    it("Sets the page title to the title of the the-rewrite post when the link is clicked.", () => {
      postList.openPost("the-rewrite");
      withPostMetaData("the-rewrite").then((meta) => {
        cy.title().should("contain", meta.title);
      });
    });

    it("Sets the title back when navigating fromt he post list page to a post and back.", () => {
      postList.openList();
      postList.openPost("the-rewrite");
      postList.openList();
      cy.title().should("contain", "Blog posts");
    });

    it("Sets the page title to the title of the the-rewrite post when navigated directly.", () => {
      post.navigateTo("the-rewrite");
      withPostMetaData("the-rewrite").then((meta) => {
        cy.title().should("contain", meta.title);
      });
    });
  });

  describe("Meta", () => {
    const expectMetaDescriptionToContain = (expectedDescription: string): void => {
      cy.get("meta[name=\"description\"]").should(($descriptionMeta) => {
        const actualDescription = $descriptionMeta.attr("content");
        expect(actualDescription).to.contain(expectedDescription);
      });
    };

    it("Sets the title appropriately on the post list page.", () => {
      postList.openList();
      expectMetaDescriptionToContain("Index of my blog posts");
    });

    it("Sets the page title to the title of the the-rewrite post when the link is clicked.", () => {
      postList.openPost("the-rewrite");
      withPostMetaData("the-rewrite").then((meta) => {
        expectMetaDescriptionToContain(meta.abstract);
      });
    });

    it("Sets the title back when navigating fromt he post list page to a post and back.", () => {
      postList.openList();
      postList.openPost("the-rewrite");
      postList.openList();
      expectMetaDescriptionToContain("Index of my blog posts");
    });

    it("Sets the page title to the title of the the-rewrite post when navigated directly.", () => {
      post.navigateTo("the-rewrite");
      withPostMetaData("the-rewrite").then((meta) => {
        expectMetaDescriptionToContain(meta.abstract);
      });
    });
  });

});
