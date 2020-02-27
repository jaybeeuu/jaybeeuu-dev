/// <reference types="cypress" />

context("POC", () => {
  it("loads", () => {
    cy.visit("https://localhost:3443");
    cy.get("#app div").should("have.text", "Hello, Client World!");
  });
});
