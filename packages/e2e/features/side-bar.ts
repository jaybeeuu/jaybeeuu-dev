import { makeClassSelectors, sideBar } from "@bickley-wallace/e2e-hooks";
import { PostSlug, withPostMetaData, getPostsAlias } from "../routes/posts";

const sideBarSelectors = makeClassSelectors(sideBar);

export const get = (): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(sideBarSelectors.block);
};

const getPostLink = (slug: PostSlug): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(sideBarSelectors.post.id(slug)).find(sideBarSelectors.post.link);
};

const getPostAbstract = (slug: PostSlug): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(sideBarSelectors.post.id(slug)).find(sideBarSelectors.post.abstract);
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
