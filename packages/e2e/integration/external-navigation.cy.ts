import * as navBar from "../features/nav-bar";

context("external nav links", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should have a link to my linked in profile.", () => {
    navBar.getLinkedInLink().should("have.attr", "href", "https://linkedin.com/in/jaybeeuu");
  });

  it("should have a link to my GitHub in profile.", () => {
    navBar.getGithubLink().should("have.attr", "href", "https://github.com/jaybeeuu");
  });
});
