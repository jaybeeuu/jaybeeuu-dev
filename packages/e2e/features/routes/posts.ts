import { PostManifest, PostMetaData } from "@bickley-wallace/compost";

export type PostSlug = "memoising-selectors" | "module-spotting" | "the-rewrite";

export const withManifest = (): Cypress.Chainable<PostManifest> => {
  return cy.fixture("posts/manifest.json").then((manifest) => {
    return manifest as PostManifest;
  });
};

export const withPostMetaData = (slug: PostSlug): Cypress.Chainable<PostMetaData> => {
  return withManifest().then((manifest) => {
    return manifest[slug];
  });
};

export const getPostsAlias = (route: PostSlug | "manifest"): string => `@get-posts-${route}`;

const registerPostRoute = (slug: PostSlug): void => {
  withPostMetaData(slug).then((postMetaData) => {
    cy.route(
      `/posts/${postMetaData.fileName}`,
      `fixture:posts/${postMetaData.fileName}`
    ).as(`get-posts-${postMetaData.slug}`);
  });
};

export const registerRoutes = (): void => {
  cy.server();

  cy.route("/posts/manifest.json", "fixture:posts/manifest.json").as("get-posts-manifest");
  registerPostRoute("memoising-selectors");
  registerPostRoute("module-spotting");
  registerPostRoute("the-rewrite");
};
