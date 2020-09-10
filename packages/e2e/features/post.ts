import { makeClassSelectors, post } from "@bickley-wallace/e2e-hooks";

const mainPanelSelectors = makeClassSelectors(post);

export const get = (): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(mainPanelSelectors.block);
};

export const getArticle = (): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(mainPanelSelectors.article);
};
