import { makeClassSelectors, postList } from "@jaybeeuu/e2e-hooks";
import type { PostSlug} from "../routes/posts";
import { withPostMetaData, getPostsAlias } from "../routes/posts";
import { getPostListLink } from "./nav-bar";

const postListSelectors = makeClassSelectors(postList);

export const get = (): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(postListSelectors.block);
};

export const openList = (): void => {
  getPostListLink().click();
  get().should("be.visible");
};

const getPostLink = (slug: PostSlug): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get<HTMLElement>(postListSelectors.link(slug));
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
