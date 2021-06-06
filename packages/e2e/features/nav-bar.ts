import { makeClassSelectors, navBar } from "@jaybeeuu/e2e-hooks";

const navBarSelectors = makeClassSelectors(navBar);

export const get = (): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(navBarSelectors.block);
};

export const getPostListLink = (): Cypress.Chainable<JQuery<HTMLElement>> => cy.get(navBarSelectors.postListLink);
export const getHomeLink = (): Cypress.Chainable<JQuery<HTMLElement>> => cy.get(navBarSelectors.homeLink);

export const getThemeSwitch = (): Cypress.Chainable<JQuery<HTMLElement>> => cy.get(navBarSelectors.switch);
