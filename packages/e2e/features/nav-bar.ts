import { makeClassSelectors, navBar } from "@bickley-wallace/e2e-hooks";
import { PostSlug, withPostMetaData, getPostsAlias } from "../routes/posts";

const navBarSelectors = makeClassSelectors(navBar);

export const get = (): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(navBarSelectors.block);
};

const getPostLink = (slug: PostSlug): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(navBarSelectors.post.id(slug)).find(navBarSelectors.post.link);
};

const getPostAbstract = (slug: PostSlug): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(navBarSelectors.post.id(slug)).find(navBarSelectors.post.abstract);
};

export const hasLinkToPost = (slug: PostSlug): void => {
  withPostMetaData(slug).then((postMetaData) => {
    getPostLink(slug).should("have.text", postMetaData.title);
    getPostAbstract(slug).should("contain.text", postMetaData.abstract);
  });
};

export const openPost = (slug: PostSlug): void => {
  getPostLink(slug).click();
  cy.wait(getPostsAlias(slug));
};
