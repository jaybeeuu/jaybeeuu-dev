import { makeClassSelectors, sideBar } from "@bickley-wallace/e2e-hooks";

const sideBarClasses = makeClassSelectors(sideBar);

export const get = (): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(sideBarClasses.block);
};