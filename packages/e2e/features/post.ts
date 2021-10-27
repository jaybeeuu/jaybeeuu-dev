
import { makeClassSelectors, post } from "@jaybeeuu/e2e-hooks";
import type { PostSlug} from "../routes/blog";
import { getPostsAlias, withPostMetaData } from "../routes/blog";

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
    cy.fixture(`blog/${meta.fileName}`).then((postContent: string) => {
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
  const article = cy.get(mainPanelSelectors.article);
  const originalShould = article.should;

  function articleShould (
    this: Cypress.Chainable<JQuery<HTMLElement>>,
    ...args: any[]
  ): Cypress.Chainable<JQuery<HTMLElement>> {
    if (isChainer<ShouldContainPostParagraphsParameters>("contain.post.paragraphs", args)) {
      shouldContainPostParagraphs(...args);
      return article;
    }
    if (isChainer<ShouldContainPostTitleParameters>("contain.post.title", args)) {
      shouldContainPostTitle(...args);
      return article;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    originalShould.apply(this, args as any);

    return article;
  }

  article.should = articleShould;
  return article;
};

export const navigateTo = (slug: PostSlug): void => {
  cy.visit(`/blog/${slug}`);
  cy.wait(getPostsAlias(slug));
};

export const navigateToAnchor = (slug: PostSlug, hash: string): void => {
  cy.visit(`/blog/${slug}#${hash}`);
};

export const getAnchor = (slug: PostSlug, hash: string): Cypress.Chainable<JQuery<HTMLElement>> => {
  return getArticle().find(`.hash-link[href="/blog/${slug}#${hash}"]`);
};

export const getAnchorDestination = (hash: string): Cypress.Chainable<JQuery<HTMLElement>> => {
  return getArticle().find(`#${hash}`);
};

export const getInlineLink = (text: string): Cypress.Chainable<JQuery<HTMLElement>> => {
  return getArticle().find(`p a:contains("${text}")`);
};
