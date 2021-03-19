
import { makeClassSelectors, main } from "@bickley-wallace/e2e-hooks";

const mainSelectors = makeClassSelectors(main);

export const getRoot = (): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(mainSelectors.root);
};
