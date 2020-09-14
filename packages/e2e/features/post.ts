
import { makeClassSelectors, post } from "@bickley-wallace/e2e-hooks";
import { PostSlug, withPostMetaData } from "../routes/posts";

const mainPanelSelectors = makeClassSelectors(post);

export const get = (): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(mainPanelSelectors.block);
};

export type ArticleShould = Cypress.Chainer<JQuery<HTMLElement>> & {
  (chainer: "contain.post", slug: PostSlug): Cypress.Chainable<JQuery<HTMLElement>>
};

export const getArticle = (): Cypress.Chainable<JQuery<HTMLElement>> & {
  should: ArticleShould
} => {
  // eslint-disable-next-line cypress/no-assigning-return-values
  const article = cy.get(mainPanelSelectors.article).as("article");

  const articleShould: ArticleShould = (
    chainer: any, ...args: any[]
  ): Cypress.Chainable<JQuery<HTMLElement>> => {
    if (chainer === "contain.post") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const [slug] = args;
      return withPostMetaData(slug).then((meta) =>{
        return cy.fixture(`posts/${meta.fileName}`).then((postContent) => {
          return cy.get(mainPanelSelectors.article).should("contain.html", postContent);
        });
      });
    }
    return cy.get(mainPanelSelectors.article).should(chainer, ...args);
  };

  article.should = articleShould;

  return article;
};

export const navigateTo = (slug: PostSlug): void => {
  cy.visit(`/post/${slug}`);
};
