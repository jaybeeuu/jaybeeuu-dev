import * as navBar from "../features/nav-bar";

describe("RSS/Atom Feeds", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should navigate to the Atom feed XML when clicking the link", () => {
    navBar
      .getAtomFeedLink()
      .should("exist")
      .and("have.attr", "type", "application/atom+xml")
      .and("have.attr", "href", "/feeds/atom.xml")
      .then(($link) => {
        // Use window.open to navigate to the feed URL
        cy.window().then((win) => {
          cy.stub(win, "open").as("windowOpen");
        });

        cy.wrap($link).click();

        cy.get("@windowOpen").should(
          "have.been.calledWith",
          "/feeds/atom.xml",
          "_blank",
        );
      });
  });

  it("should not redirect to 404 when accessing the Atom feed directly", () => {
    // Visit the feed directly to ensure it doesn't redirect to 404
    cy.request("/feeds/atom.xml").then((response) => {
      expect(response.status).to.eq(200);
      expect(response.headers["content-type"]).to.include(
        "application/atom+xml",
      );
    });
  });
});
