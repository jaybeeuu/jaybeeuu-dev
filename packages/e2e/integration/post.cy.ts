import * as navBar from "../features/nav-bar";
import * as post from "../features/post";
import * as postList from "../features/post-list";
import {
  registerRoutes,
  slugs,
  withPostMetaData
} from "../routes/blog";

context("Post navigation", (): void => {
  beforeEach(() => {
    cy.visit("/");
    registerRoutes();
  });

  slugs.forEach((slug) => {
    describe(slug, () => {
      it(`shows the paragraphs of the ${slug} post when you navigate to that post.`, () => {
        post.navigateTo(slug);
        post.getArticle().should("contain.post.paragraphs", slug);
      });

      it(`shows the title of the ${slug} post when you navigate to that post.`, () => {
        post.navigateTo(slug);
        post.getArticle().should("contain.post.title", slug);
      });

      it(`shows the title of the ${slug} publish date when you navigate to that post.`, () => {
        post.navigateTo(slug);
        post.getArticle().should("contain.post.publishDate", slug);
      });

      it(`shows the title of the ${slug} reading time when you navigate to that post.`, () => {
        post.navigateTo(slug);
        post.getArticle().should("contain.post.readingTime", slug);
      });

      it(`sets the page title to the title of the ${slug} post when you navigate to the page.`, () => {
        post.navigateTo(slug);
        withPostMetaData(slug).then((meta) => {
          cy.title().should("contain", meta.title);
        });
      });
    });
  });

  it("shows the title of the module-spotting last update date when you navigate to that post.", () => {
    post.navigateTo("module-spotting");
    post.getArticle().should("contain.post.lastUpdateDate", "module-spotting");
  });

  it("switches back to the post list when you navigate to that post after opening a post.", () => {
    post.navigateTo("the-rewrite");
    navBar.getPostListLink().click();
    postList.get().should("be.visible");
  });

  describe("hash links", () => {
    it("scrolls to an anchor when loading a page from scratch with a hash.", () => {
      post.navigateTo("module-spotting");
      post.navigateToAnchor("module-spotting", "commonjs");
      post.getAnchorDestination("commonjs").should("be.visible");
    });

    it("scrolls to an anchor when clicking an inline link with a hash.", () => {
      postList.openPost("module-spotting");
      post.getInlineLink("CommonJS").click();
      post.getAnchorDestination("commonjs").should("be.visible");
    });

    it("scrolls to an anchor when clicking an inline link with a hash, which leads to a header further up the page.", () => {
      post.navigateTo("module-spotting");
      post.getInlineLink("AMD").click();
      post.getAnchorDestination("amd").should("be.visible");
    });

    it("scrolls to an anchor when clicking an inline link with a hash.", () => {
      post.navigateTo("module-spotting");
      post.getInlineLink("CommonJS").click();
      post.getAnchorDestination("commonjs").should("be.visible");
    });
  });
});
