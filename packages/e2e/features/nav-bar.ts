import { makeClassSelectors, navBar } from "@jaybeeuu/e2e-hooks";

const navBarSelectors = makeClassSelectors(navBar);

export const get = (): Cypress.Chainable<JQuery> => {
  return cy.get(navBarSelectors.block);
};

export const getGithubLink = (): Cypress.Chainable<JQuery<HTMLAnchorElement>> =>
  cy.get(navBarSelectors.gitHubLink);
export const getLinkedInLink = (): Cypress.Chainable<
  JQuery<HTMLAnchorElement>
> => cy.get(navBarSelectors.linkedInLink);
export const getHomeLink = (): Cypress.Chainable<JQuery<HTMLAnchorElement>> =>
  cy.get(navBarSelectors.homeLink);
export const getPostListLink = (): Cypress.Chainable<
  JQuery<HTMLAnchorElement>
> => cy.get(navBarSelectors.postsListLink);
export const getThemeSwitch = (): Cypress.Chainable<JQuery> =>
  cy.get(navBarSelectors.switch);
