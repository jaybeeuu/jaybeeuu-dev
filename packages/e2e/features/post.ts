
import { makeClassSelectors, post } from "@bickley-wallace/e2e-hooks";
import { PostSlug, withPostMetaData } from "../routes/posts";

const mainPanelSelectors = makeClassSelectors(post);

export const get = (): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(mainPanelSelectors.block);
};

export type ShouldContainPostParagraphsParameters = ["contain.post.paragraphs", PostSlug];
export type ShouldContainPostTitleParameters = ["contain.post.title", PostSlug];

export interface ArticleChainer extends Cypress.Chainer<JQuery<HTMLElement>> {
  (
    ...[chainer, slug]: ShouldContainPostTitleParameters
  ): Cypress.Chainable<JQuery<HTMLElement>>;
  (
    ...[chainer, slug]: ShouldContainPostParagraphsParameters
  ): Cypress.Chainable<JQuery<HTMLElement>>;
}

export type ArticleChainable = Cypress.Chainable<JQuery<HTMLElement>> & {
  should: ArticleChainer
};

const shouldContainPostParagraphs = (...[, slug]: ShouldContainPostParagraphsParameters): void => {
  withPostMetaData(slug).then((meta) => {
    cy.fixture(`posts/${meta.fileName}`).then((postContent: string) => {
      const paragraphs = [...postContent.matchAll(/(<p>.*?<\/p>)/g)].flat();
      if (!paragraphs) {
        throw new Error("Post did not contain any paragraphs.");
      }
      paragraphs.forEach((paragraph) => {
        cy.get(mainPanelSelectors.article).find("article").should("contain.html", paragraph);
      });
    });
  });
};

const shouldContainPostTitle = (...[, slug]: ShouldContainPostTitleParameters): void => {
  withPostMetaData(slug).then((meta) => {
    cy.get(mainPanelSelectors.article).should("contain.text", meta.title);
  });
};

const isChainer = <ChainerArgs extends [string, ...any[]]>(
  chainerType: ChainerArgs[0],
  args: any[]
): args is ChainerArgs => {
  return args[0] === chainerType;
};

export const getArticle = (): ArticleChainable => {
  // eslint-disable-next-line cypress/no-assigning-return-values
  const article = cy.get(mainPanelSelectors.article).as("article");

  const articleShould: ArticleChainer = (
    ...args: [any, ...any[]]
  ): Cypress.Chainable<JQuery<HTMLElement>> => {
    if (isChainer<ShouldContainPostParagraphsParameters>("contain.post.paragraphs", args)) {
      shouldContainPostParagraphs(...args);
      return article;
    }
    if (isChainer<ShouldContainPostTitleParameters>("contain.post.title", args)) {
      shouldContainPostTitle(...args);
      return article;
    }
    cy.get(mainPanelSelectors.article).should(...args);
    return article;
  };

  article.should = articleShould;
  return article;
};

export const navigateTo = (slug: PostSlug): void => {
  cy.visit(`/posts/${slug}`);
};

export const navigateToAnchor = (slug: PostSlug, hash: string): void => {
  cy.visit(`/posts/${slug}#${hash}`);
};

export const getAnchor = (slug: PostSlug, hash: string): Cypress.Chainable<JQuery<HTMLElement>> => {
  return getArticle().find(`a[href="/posts/${slug}#${hash}"]`);
};
