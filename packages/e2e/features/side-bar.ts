import { makeClassSelectors, sideBar } from "@bickley-wallace/e2e-hooks";

const sideBarSelectors = makeClassSelectors(sideBar);

export const get = (): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(sideBarSelectors.block);
};

export const getGreeting = (): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(sideBarSelectors.greeting);
};

export const getApiResults = (): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(sideBarSelectors.apiResults);
};