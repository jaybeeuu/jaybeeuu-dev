import { makeClassSelectors, titleBar } from "@bickley-wallace/e2e-hooks";

import { registerRoutes, PostRoutes } from "../features/routes";

const titleBarselectors = makeClassSelectors(titleBar);

context("POC", (): void => {
  before(() => {
    registerRoutes();
    cy.visit("/");
    cy.wait(PostRoutes.GET_MANIFEST);
  });

  it("loads", (): void => {
    cy.title().should('equal', "Josh Bickley-Wallace");
  });

  it("pings the API successfully", (): void => {
    cy.get(titleBarselectors.greeting).should("have.text", "Hello, Client World!");
    cy.get(titleBarselectors.apiResults).should("contain.text", "\"status\": \"complete\"");
  });
});
