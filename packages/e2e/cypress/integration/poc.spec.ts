import { titleBar } from "@bickley-wallace/e2e-hooks/title-bar";

const asClass = (identifier: string): string => `.${identifier}`;

const titleBarHooks = titleBar();

context("POC", (): void => {
  it("loads", (): void => {
    cy.visit("/");
    cy.get(asClass(titleBarHooks.greeting)).should("have.text", "Hello, Client World!");
  });
});
