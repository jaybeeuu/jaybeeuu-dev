import { makeClassSelectors, sideBar } from "@bickley-wallace/e2e-hooks";

const sideBarSelectors = makeClassSelectors(sideBar);

export const get = (): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(sideBarSelectors.block);
};

export const getPostLink = (slug: string): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(sideBarSelectors.post.id(slug)).find(sideBarSelectors.post.link);
};

export const getPostAbstract = (slug: string): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(sideBarSelectors.post.id(slug)).find(sideBarSelectors.post.abstract);
};
