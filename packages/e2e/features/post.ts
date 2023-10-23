import { makeClassSelectors, post } from "@jaybeeuu/e2e-hooks";
import type { PostSlug} from "../routes/blog";
import { getPostsAlias, withPostMetaData } from "../routes/blog";

const mainPanelSelectors = makeClassSelectors(post);

export const get = (): Cypress.Chainable<JQuery> => {
  return cy.get(mainPanelSelectors.block);
};

export type ShouldContainPostParagraphsParameters = ["contain.post.paragraphs", PostSlug];
export type ShouldContainPostTitleParameters = ["contain.post.title", PostSlug];
export type ShouldContainPostPublishDateParameters = ["contain.post.publishDate", PostSlug];
export type ShouldContainPostLastUpdateDateParameters = ["contain.post.lastUpdateDate", PostSlug];
export type ShouldContainPostReadingTimeParameters = ["contain.post.readingTime", PostSlug];

export interface ArticleChainer extends Cypress.Chainer<JQuery> {
  (
    ...[chainer, slug]: ShouldContainPostTitleParameters
  ): Cypress.Chainable<JQuery>;
  (
    ...[chainer, slug]: ShouldContainPostParagraphsParameters
  ): Cypress.Chainable<JQuery>;
  (
    ...[chainer, slug]: ShouldContainPostPublishDateParameters
  ): Cypress.Chainable<JQuery>;
  (
    ...[chainer, slug]: ShouldContainPostLastUpdateDateParameters
  ): Cypress.Chainable<JQuery>;
  (
    ...[chainer, slug]: ShouldContainPostReadingTimeParameters
  ): Cypress.Chainable<JQuery>;
}

export type ArticleChainable = Cypress.Chainable<JQuery> & {
  should: ArticleChainer
};

const getArticleBlock = (): Cypress.Chainable<JQuery> => cy.get(mainPanelSelectors.block);

const shouldContainPostParagraphs = (
  ...[, slug]: ShouldContainPostParagraphsParameters
): void => {
  withPostMetaData(slug).then((meta) => {
    cy.fixture(`blog/${meta.fileName}`).then((postContent: string) => {
      const paragraphs = [...postContent.matchAll(/(<p>.*?<\/p>)/g)].flat();
      if (paragraphs.length === 0) {
        throw new Error("Post did not contain any paragraphs.");
      }
      paragraphs.forEach((paragraph) => {
        getArticleBlock().find(mainPanelSelectors.article).should("contain.html", paragraph);
      });
    });
  });
};

const shouldContainPostTitle = (
  ...[, slug]: ShouldContainPostTitleParameters
): void => {
  withPostMetaData(slug).then((meta) => {
    getArticleBlock().find(mainPanelSelectors.header).should("contain.text", meta.title);
  });
};

const shouldContainPostPublishDate = (
  ...[, slug]: ShouldContainPostPublishDateParameters
): void => {
  withPostMetaData(slug).then((meta) => {
    getArticleBlock().find(mainPanelSelectors.header).should(
      "contain.text",
      new Date(meta.publishDate).toLocaleDateString()
    );
  });
};

const shouldContainPostLastUpdateDate = (
  ...[, slug]: ShouldContainPostLastUpdateDateParameters
): void => {
  withPostMetaData(slug).then((meta) => {
    getArticleBlock().find(mainPanelSelectors.header).should(
      "contain.text",
      meta.lastUpdateDate
        ? `(updated ${new Date(meta.lastUpdateDate).toLocaleDateString()})`
        : "(updated )"
    );
  });
};

const shouldContainPostReadingTime = (
  ...[, slug]: ShouldContainPostReadingTimeParameters
): void => {
  withPostMetaData(slug).then((meta) => {
    getArticleBlock().find(mainPanelSelectors.header).should(
      "contain.text",
      meta.readingTime.text
    );
  });
};

const isChainer = <ChainerArgs extends [string, ...unknown[]]>(
  chainerType: ChainerArgs[0],
  args: unknown[]
): args is ChainerArgs => {
  return args[0] === chainerType;
};

export const getArticle = (): ArticleChainable => {
  // eslint-disable-next-line cypress/no-assigning-return-values
  const article = cy.get(mainPanelSelectors.article);
  const originalShould = article.should;

  function articleShould (
    this: Cypress.Chainable<JQuery>,
    ...args: unknown[]
  ): Cypress.Chainable<JQuery> {
    if (isChainer<ShouldContainPostParagraphsParameters>("contain.post.paragraphs", args)) {
      shouldContainPostParagraphs(...args);
      return article;
    }
    if (isChainer<ShouldContainPostTitleParameters>("contain.post.title", args)) {
      shouldContainPostTitle(...args);
      return article;
    }
    if (isChainer<ShouldContainPostPublishDateParameters>("contain.post.publishDate", args)) {
      shouldContainPostPublishDate(...args);
      return article;
    }
    if (isChainer<ShouldContainPostLastUpdateDateParameters>("contain.post.lastUpdateDate", args)) {
      shouldContainPostLastUpdateDate(...args);
      return article;
    }
    if (isChainer<ShouldContainPostReadingTimeParameters>("contain.post.readingTime", args)) {
      shouldContainPostReadingTime(...args);
      return article;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
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

export const getAnchor = (slug: PostSlug, hash: string): Cypress.Chainable<JQuery> => {
  return getArticle().find(`.hash-link[href="/blog/${slug}#${hash}"]`);
};

export const getAnchorDestination = (hash: string): Cypress.Chainable<JQuery> => {
  return getArticle().find(`#${hash}`);
};

export const getInlineLink = (text: string): Cypress.Chainable<JQuery> => {
  return getArticle().find(`p a:contains("${text}")`);
};
