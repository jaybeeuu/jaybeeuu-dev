import { makeClassSelectors, postList } from "@jaybeeuu/e2e-hooks";
import type { PostSlug } from "../routes/blog";
import { withPostMetaData, getPostsAlias } from "../routes/blog";
import { getPostListLink } from "./nav-bar";

const postListSelectors = makeClassSelectors(postList);

export const get = (): Cypress.Chainable<JQuery> => {
  return cy.get(postListSelectors.block);
};

export const openList = (): void => {
  getPostListLink().click();
  get().should("be.visible");
};

export const getPostLinkSlugs = (): Cypress.Chainable<string[]> => {
  return cy.get(postListSelectors.link).then(($links): string[] => {
    return $links.map((index, link) => link.getAttribute("data-slug")).get();
  });
};

const getPostLink = (slug: PostSlug): Cypress.Chainable<JQuery> => {
  return cy.get(postListSelectors.sluggedLink(slug));
};

export const hasLinkToPost = (slug: PostSlug): void => {
  withPostMetaData(slug).then((postMetaData) => {
    getPostLink(slug).should("contain.text", postMetaData.title);
    getPostLink(slug).should("contain.text", postMetaData.abstract);
  });
};

export const openPost = (slug: PostSlug): void => {
  openList();
  getPostLink(slug).click();
  cy.wait(getPostsAlias(slug));
};
