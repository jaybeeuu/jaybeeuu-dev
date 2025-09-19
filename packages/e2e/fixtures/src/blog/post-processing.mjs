// @ts-check

import fs from "node:fs";

/**
 * @typedef {import("@jaybeeuu/compost").PostManifest} PostManifest
 * @typedef {import("@jaybeeuu/compost").PostMetadata} PostMetadata
 */

const manifestPath = "./fixtures/blog/manifest.json";

/**
 * @return {Promise<PostManifest>}
 */
const readManifest = async () => {
  const string = await fs.promises.readFile(manifestPath, "utf-8");
  return JSON.parse(string);
};

/**
 * @param {PostManifest} manifest
 * @return {Promise<void>}
 */
const writeManifest = (manifest) => {
  const asString = JSON.stringify(manifest, null, 2);
  return fs.promises.writeFile(manifestPath, asString, "utf-8");
};

/**
 * @typedef {"memoising-selectors" | "module-spotting" | "the-rewrite"} PostSlug
 * @type {Partial<{ [slug in PostSlug]: Partial<PostMetadata> }>}
 */
const manifestTransformations = {
  "memoising-selectors": {
    publishDate: "Fri, 01 Jan 2021 00:00:00 GMT",
    lastUpdateDate: "Sat, 01 May 2021 00:00:00 GMT",
  },
  "module-spotting": {
    publishDate: "Mon, 01 Feb 2021 00:00:00 GMT",
  },
  "the-rewrite": {
    publishDate: "Mon, 01 Mar 2021 00:00:00 GMT",
  },
};

/**
 * @returns {Promise<void>}
 */
const transformManifest = async () => {
  const original = await readManifest();

  /** @type {PostManifest} */
  const transformedManifest = Object.entries(original).reduce(
    /**
     *
     * @param {PostManifest} transformed
     * @param {[string, PostMetadata]} param1
     * @returns
     */
    (transformed, [slug, meta]) => {
      transformed[slug] = {
        ...meta,
        // @ts-expect-error In practice I'm only overwriting some of the metadata.
        ...manifestTransformations[slug],
      };
      return transformed;
    },
    {},
  );

  await writeManifest(transformedManifest);
};

void transformManifest();
