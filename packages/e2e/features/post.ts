import { makeClassSelectors, post } from "@bickley-wallace/e2e-hooks";
import { PostSlug } from "../routes/posts";

const mainPanelSelectors = makeClassSelectors(post);

export const get = (): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(mainPanelSelectors.block);
};

export const getArticle = (): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(mainPanelSelectors.article);
};

export const navigateTo = (slug: PostSlug): void => {
  cy.visit(`/post/${slug}`);
};
