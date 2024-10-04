import preact from "@preact/preset-vite";
import fs from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";
import { imagetools } from "vite-imagetools";
import { viteStaticCopy } from "vite-plugin-static-copy";
import type { SiteMapUrl } from "./build-plugins";
import { cssModuleTypes, feed, siteMap, version } from "./build-plugins";
import { paths } from "./config/paths";
import type { PostManifest } from "@jaybeeuu/compost/lib";
import istanbulPlugin from "vite-plugin-istanbul";

console.log("VITE_COVERAGE", process.env.VITE_COVERAGE);

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const postManifest: PostManifest = JSON.parse(
  fs.readFileSync(paths.manifest, "utf8"),
);

const resolvedURLToBase = (...pathFragments: string[]): string => {
  const url = new URL(paths.baseUrl);
  return (url.pathname = path.posix.join(url.pathname, ...pathFragments));
};
const isProduction = process.env.NODE_ENV === "production";

export default defineConfig({
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
    },
  },
  server: isProduction
    ? undefined
    : {
        port: 3443,
        https: {
          ca: fs.readFileSync("./certs/ca.pem"),
          key: fs.readFileSync("./certs/key.key"),
          cert: fs.readFileSync("./certs/cert.crt"),
        },
      },
  build: {
    assetsInlineLimit: (filePath: string) => {
      return filePath.endsWith(".sprite.svg") ? false : undefined;
    },
  },
  plugins: [
    preact(),
    istanbulPlugin({
      requireEnv: true,
      forceBuildInstrument: true,
    }),
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
          dest: paths.postsRoot,
        },
      ],
    }),
    siteMap({
      baseUrl: paths.baseUrl,
      filename: "sitemap.xml",
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
                (meta) => +new Date(meta.lastUpdateDate ?? meta.publishDate),
              ),
            ),
          ),
          priority: 0.8,
          changeFrequency: "weekly",
        },
        ...Object.values(postManifest).map(
          (meta): SiteMapUrl => ({
            location: path.posix.join(paths.postsRoot, meta.slug),
            lastModified: new Date(meta.lastUpdateDate ?? meta.publishDate),
            priority: 0.5,
            changeFrequency: "monthly",
          }),
        ),
        {
          location: `/feeds/atom.xnl`,
          lastModified: new Date(),
          priority: 0.3,
          changeFrequency: "weekly",
        },
        {
          location: `/feeds/rss.xnl`,
          lastModified: new Date(),
          priority: 0.3,
          changeFrequency: "weekly",
        },
      ],
    }),
    feed({
      atomFileName: "feeds/atom.xml",
      rssFileName: "feeds/rss.xml",
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
            }),
          ),
        ),
        copyright: `All rights reserved ${new Date().getFullYear()}, Josh Bickley-Wallace`,
        feedLinks: {
          atom: "feeds/atom.xml",
          rss: "feeds/rss.xml",
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
    version({ fileName: "version.json" }),
    cssModuleTypes(),
  ],
});
