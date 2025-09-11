import * as navBar from "../features/nav-bar";
import * as e2eHooks from "@jaybeeuu/e2e-hooks";
import { registerRoutes } from "../routes/blog";

context("Navigation Links", () => {
  beforeEach(() => {
    registerRoutes();
  });

  it("should render navigation links correctly on home page", () => {
    cy.visit("/");
    navBar.getHomeLink().should("exist").and("contain.text", "Home");
    navBar.getHomeLink().should("have.class", e2eHooks.navBar.activeLink);
    navBar.getPostListLink().should("exist").and("contain.text", "Blog");
    navBar
      .getPostListLink()
      .should("not.have.class", e2eHooks.navBar.activeLink);
  });

  it("should render navigation links correctly on blog page", () => {
    cy.visit("/blog");
    navBar.getHomeLink().should("exist").and("contain.text", "Home");
    navBar.getHomeLink().should("not.have.class", e2eHooks.navBar.activeLink);
    navBar.getPostListLink().should("exist").and("contain.text", "Blog");
    navBar.getPostListLink().should("have.class", e2eHooks.navBar.activeLink);
  });

  it("should render navigation links correctly on individual post", () => {
    cy.visit("/blog/memoising-selectors");
    navBar.getHomeLink().should("exist").and("contain.text", "Home");
    navBar.getPostListLink().should("exist").and("contain.text", "Blog");
    navBar.getHomeLink().should("not.have.class", e2eHooks.navBar.activeLink);
    navBar
      .getPostListLink()
      .should("not.have.class", e2eHooks.navBar.activeLink);
  });

  it("should allow navigation between pages via nav links", () => {
    cy.visit("/");
    navBar.getPostListLink().click();
    cy.url().should("include", "/blog");

    navBar.getHomeLink().click();
    cy.url().should("not.include", "/blog");
  });
});
