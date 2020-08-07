import { titleBar } from "@bickley-wallace/e2e-hooks";

import { registerRoutes, PostRoutes } from "../support/routes";

const asClassSelector = (identifier: string): string => `.${identifier}`;

context("POC", (): void => {
  before(() => {
    registerRoutes();
  });

  it("loads", (): void => {
    cy.visit("/");
    cy.wait(PostRoutes.GET_MANIFEST);
    cy.get(asClassSelector(titleBar.greeting)).should("have.text", "Hello, Client World!");
  });

  it("pings the API successfully", (): void => {
    cy.get(asClassSelector(titleBar.apiResults)).should("contain.text", "\"status\": \"complete\"");
  });
});
