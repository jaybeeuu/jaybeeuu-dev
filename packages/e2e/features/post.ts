
import { makeClassSelectors, post } from "@bickley-wallace/e2e-hooks";
import { PostSlug, withPostMetaData } from "../routes/posts";

const mainPanelSelectors = makeClassSelectors(post);

export const get = (): Cypress.Chainable<JQuery<HTMLElement>> => {
  return cy.get(mainPanelSelectors.block);
};

export type ShouldContainPostParameters = ["contain.post.paragraphs", PostSlug];

export interface ArticleChainer extends Cypress.Chainer<JQuery<HTMLElement>> {
  (...[chainer, slug]: ShouldContainPostParameters): Cypress.Chainable<JQuery<HTMLElement>>;
}

export type ArticleChainable = Cypress.Chainable<JQuery<HTMLElement>> & {
  should: ArticleChainer
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
    if (isChainer<ShouldContainPostParameters>("contain.post.paragraphs", args)) {
      const [, slug] = args;
      return withPostMetaData(slug).then((meta) => {
        return cy.fixture(`posts/${meta.fileName}`).then((postContent: string) => {
          const paragraphs = [...postContent.matchAll(/(<p>.*?<\/p>)/g)].flat();
          if (!paragraphs) {
            throw new Error("Post did not contain any paragraphs.");
          }
          paragraphs.forEach((paragraph) => {
            cy.get(mainPanelSelectors.article).should("contain.html", paragraph);
          });
          return article;
        });
      });
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
