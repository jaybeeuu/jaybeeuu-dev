import { makeClassSelectors, postList } from "@bickley-wallace/e2e-hooks";
import { PostSlug, withPostMetaData, getPostsAlias } from "../routes/posts";
import { getPostListLink } from "./nav-bar";

const postListSelectors = makeClassSelectors(postList);

export const get = (): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(postListSelectors.block);
};

const getPostLink = (slug: PostSlug): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(postListSelectors.id(slug)).find(postListSelectors.link);
};

const getPostAbstract = (slug: PostSlug): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(postListSelectors.id(slug)).find(postListSelectors.abstract);
};

export const hasLinkToPost = (slug: PostSlug): void => {
  withPostMetaData(slug).then((postMetaData) => {
    getPostLink(slug).should("have.text", postMetaData.title);
    getPostAbstract(slug).should("contain.text", postMetaData.abstract);
  });
};

export const openPost = (slug: PostSlug): void => {
  getPostListLink().click();
  getPostLink(slug).click();
  cy.wait(getPostsAlias(slug));
};