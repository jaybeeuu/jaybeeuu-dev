import { makeClassSelectors, fourOhFour } from "@jaybeeuu/e2e-hooks";

const fourOhFourSelectors = makeClassSelectors(fourOhFour);

export const getRoot = (): Cypress.Chainable<JQuery> => {
  return cy.get(fourOhFourSelectors.root);
};
