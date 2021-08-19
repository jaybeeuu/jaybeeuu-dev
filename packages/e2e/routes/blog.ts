import type { PostManifest, PostMetaData } from "@jaybeeuu/compost";
import { assertIsNotNullish } from "@jaybeeuu/utilities";

export type PostSlug = "memoising-selectors" | "module-spotting" | "the-rewrite";

export const withManifest = (): Cypress.Chainable<PostManifest> => {
  return cy.fixture("blog/manifest.json").then((manifest) => {
    return manifest as PostManifest;
  });
};

export const withPostMetaData = (slug: PostSlug): Cypress.Chainable<PostMetaData> => {
  return withManifest().then((manifest) => {
    const meta = manifest[slug];
    assertIsNotNullish(meta);
    return meta;
  });
};

export const getPostsAlias = <Route extends PostSlug | "manifest">(
  route: Route
): `@get-blog-${Route}` => `@get-blog-${route}`;

const registerPostRoute = (slug: PostSlug): void => {
  withPostMetaData(slug).then((postMetaData) => {
    cy.intercept(
      `/blog/${postMetaData.fileName}`,
      { fixture: `blog/${postMetaData.fileName}` }
    ).as(`get-blog-${postMetaData.slug}`);
  });
};

export const registerRoutes = (): void => {
  cy.intercept(
    "/blog/manifest.json",
    { fixture: "blog/manifest.json" }
  ).as("get-blog-manifest");
  registerPostRoute("memoising-selectors");
  registerPostRoute("module-spotting");
  registerPostRoute("the-rewrite");
};

export const registerEmptyRoutes = (): void => {
  cy.intercept("/blog/manifest.json", { body: {} }).as("get-blog-manifest");
};
