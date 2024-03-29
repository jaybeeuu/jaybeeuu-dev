import preact from "@preact/preset-vite";
import fs from "node:fs";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { imagetools } from "vite-imagetools";
import type { Url } from "@aminnairi/rollup-plugin-sitemap";
import { sitemap } from "@aminnairi/rollup-plugin-sitemap";
import { paths } from "./config/paths";
import type { PostManifest } from "@jaybeeuu/compost";
import { feed } from "@jaybeeuu/rollup-plugin-feed";
import path from "node:path";

const postsRoot = "blog";
const baseUrl = "https://jaybeeuu.dev";

const resolvedURLToBase = (...pathFragments: string[]): string => {
  const url = new URL(baseUrl);
  return (url.pathname = path.posix.join(url.pathname, ...pathFragments));
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const postManifest: PostManifest = JSON.parse(
  fs.readFileSync(paths.manifest, "utf8")
);

export default defineConfig({
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
    },
  },
  server: {
    port: 3443,
    https: {
      ca: fs.readFileSync("./certs/ca.pem"),
      key: fs.readFileSync("./certs/key.key"),
      cert: fs.readFileSync("./certs/cert.crt"),
    },
  },
  plugins: [
    preact(),
    imagetools({
      defaultDirectives: (url) => {
        if (url.searchParams.has("placeholder")) {
          return new URLSearchParams({
            w: "100",
            format: "jpg",
            blur: "0.75",
            progressive: "true",
          });
        }

        if (url.searchParams.has("background")) {
          return new URLSearchParams({
            w: "1800",
            format: "jpg",
            progressive: "true",
          });
        }

        return new URLSearchParams();
      },
    }),
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/@jaybeeuu/posts/lib/*",
          dest: postsRoot,
        },
      ],
    }),

    // @ts-expect-error this is a rollup plugin, it's compatible though.
    sitemap({
      baseUrl,
      urls: [
        {
          location: "/",
          priority: 0.3,
          changeFrequency: "yearly",
        },
        {
          location: `/${postsRoot}`,
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
        ...Object.values(postManifest).map(
          (meta): Url => ({
            location: path.posix.join(postsRoot, meta.slug),
            lastModified: new Date(meta.lastUpdateDate ?? meta.publishDate),
            priority: 0.5,
            changeFrequency: "monthly",
          })
        ),
      ],
    }),

    // @ts-expect-error this is a rollup plugin, it's compatible though.
    feed({
      atomFileName: "feeds/atom.xml",
      rssFileName: "feeds/rss.xml",
      feedOptions: {
        title: "Josh Bickley-Wallace",
        description: "Software engineering.",
        id: baseUrl,
        link: baseUrl,
        language: "en",
        favicon: baseUrl,
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
          link: baseUrl,
        },
      },
      items: Object.values(postManifest).map(
        /**
         * @param {import("@jaybeeuu/compost").PostMetaData} meta
         * @returns {import("@jaybeeuu/feed-webpack-plugin").FeedItem}
         */
        (meta) => ({
          date: new Date(meta.publishDate),
          description: meta.abstract,
          id: meta.slug,
          link: resolvedURLToBase(postsRoot, meta.slug),
          published: new Date(meta.publishDate),
          title: meta.title,
        })
      ),
    }),
  ],
});
