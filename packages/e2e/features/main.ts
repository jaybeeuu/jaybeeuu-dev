
import { makeClassSelectors, main } from "@jaybeeuu/e2e-hooks";

const mainSelectors = makeClassSelectors(main);

export const getRoot = (): Cypress.Chainable<JQuery> => {
  return cy.get(mainSelectors.root);
};
