import type {
  PostManifest,
  PostManifestEntry as PostMetadata,
} from "@jaybeeuu/posts/types";
import { assertIsNotNullish } from "@jaybeeuu/utilities";

export const slugs = [
  "memoising-selectors",
  "module-spotting",
  "the-rewrite",
] as const;
export type PostSlug = (typeof slugs)[number];

export const withManifest = (): Cypress.Chainable<PostManifest> => {
  return cy.fixture("blog/post-manifest.json").then((manifest) => {
    return manifest as PostManifest;
  });
};

export const withPostMetaData = (
  slug: PostSlug,
): Cypress.Chainable<PostMetadata> => {
  return withManifest().then((manifest) => {
    const meta = manifest.entries[slug];
    assertIsNotNullish(meta);
    return meta;
  });
};

export const getPostsAlias = <Route extends PostSlug | "manifest">(
  route: Route,
): `@get-blog-${Route}` => `@get-blog-${route}`;

const registerPostRoute = (slug: PostSlug): void => {
  withPostMetaData(slug).then((postMetaData) => {
    cy.intercept(postMetaData.href, {
      fixture: `blog/${postMetaData.fileName}`,
    }).as(`get-blog-${postMetaData.slug}`);
  });
};

export const registerRoutes = (): void => {
  cy.intercept("/blog/post-manifest.json", {
    fixture: "blog/post-manifest.json",
  }).as("get-blog-manifest");
  registerPostRoute("memoising-selectors");
  registerPostRoute("module-spotting");
  registerPostRoute("the-rewrite");
};

export const registerEmptyRoutes = (): void => {
  cy.intercept("/blog/post-manifest.json", {
    body: {
      version: 2,
      metadata: {
        generatedAt: new Date().toISOString(),
        entryCount: 0,
        overallHash: "empty",
      },
      entries: {},
    },
  }).as("get-blog-manifest");
};
