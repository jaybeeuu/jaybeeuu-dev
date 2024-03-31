// @ts-check

import fs from "node:fs";
import path from "node:path";
import { feed } from "./feed.js";
import { siteMap } from "./site-map.js";
import { paths } from "../config/paths.js";

/**
 * @type {import("@jaybeeuu/compost").PostManifest}
 */
const postManifest = JSON.parse(fs.readFileSync(paths.manifest, "utf8"));

/**
 *
 * @param  {...string} pathFragments
 * @returns {string}
 */
const resolvedURLToBase = (...pathFragments) => {
  const url = new URL(paths.baseUrl);
  return (url.pathname = path.posix.join(url.pathname, ...pathFragments));
};

await Promise.all([
  siteMap({
    baseUrl: paths.baseUrl,
    siteMapFilename: path.join(paths.dist, "sitemap.xml"),
    urls: [
      {
        location: "/",
        priority: 0.3,
        changeFrequency: "yearly",
      },
      {
        location: `/${paths.postsRoot}`,
        lastModified: new Date(
          Math.max(
            ...Object.values(postManifest).map(
              (meta) => +new Date(meta.lastUpdateDate ?? meta.publishDate)
            )
          )
        ),
        priority: 0.8,
        changeFrequency: "weekly",
      },
      ...Object.values(postManifest).map((meta) => ({
        location: path.posix.join(paths.postsRoot, meta.slug),
        lastModified: new Date(meta.lastUpdateDate ?? meta.publishDate),
        priority: 0.5,
        changeFrequency: "monthly",
      })),
    ],
  }),
  feed({
    atomFileName: path.join(paths.dist, "feeds/atom.xml"),
    rssFileName: path.join(paths.dist, "feeds/rss.xml"),
    feedOptions: {
      title: "Josh Bickley-Wallace",
      description: "Software engineering.",
      id: paths.baseUrl,
      link: paths.baseUrl,
      language: "en",
      favicon: paths.baseUrl,
      updated: new Date(
        Math.max(
          ...Object.values(postManifest).map((meta) => {
            return +new Date(meta.publishDate);
          })
        )
      ),
      copyright: `All rights reserved ${new Date().getFullYear()}, Josh Bickley-Wallace`,
      feedLinks: {
        atom: resolvedURLToBase("feeds/atom.xml"),
        rss: resolvedURLToBase("feeds/rss.xml"),
      },
      author: {
        name: "Josh Bickley-Wallace",
        email: "joshbickleywallace@outlook.com",
        link: paths.baseUrl,
      },
    },
    items: Object.values(postManifest).map((meta) => ({
      date: new Date(meta.publishDate),
      description: meta.abstract,
      id: meta.slug,
      link: resolvedURLToBase(paths.postsRoot, meta.slug),
      published: new Date(meta.publishDate),
      title: meta.title,
    })),
  }),
]);
