import { makeClassSelectors, theme } from "@bickley-wallace/e2e-hooks";

const themeSelectors = makeClassSelectors(theme);

export const getThemeRoot = (): Cypress.Chainable<JQuery<HTMLElement>> => cy.get(themeSelectors.root);
