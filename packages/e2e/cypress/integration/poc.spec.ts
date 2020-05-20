import { titleBar } from "@bickley-wallace/e2e-hooks";

const asClass = (identifier: string): string => `.${identifier}`;

context("POC", (): void => {
  it("loads", (): void => {
    cy.visit("/");
    cy.get(asClass(titleBar.greeting)).should("have.text", "Hello, Client World!");
  });

  it("pings the API sunncessfully", (): void => {
    cy.get(asClass(titleBar.apiResults)).should("contain.text", "\"status\": \"complete\"");
  });
});
