import * as navBar from "../features/nav-bar";
import * as fourOhFour from "../features/four-oh-four";

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
      .click();
    cy.url().should("include", "/feeds/atom.xml");
    fourOhFour.getRoot().should("not.exist");
  });

  it("should serve atom feed from server with correct content-type", () => {
    cy.request("/feeds/atom.xml").then((response) => {
      expect(response.status).to.eq(200);
      expect(response.headers["content-type"]).to.include(
        "application/atom+xml",
      );
    });
  });

  it("should bypass client-side router for atom feed requests", () => {
    navBar
      .getAtomFeedLink()
      .should("have.attr", "href", "/feeds/atom.xml")
      .click();
    cy.url().should("include", "/feeds/atom.xml");
  });
});
