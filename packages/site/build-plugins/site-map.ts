import type { Plugin } from "vite";
import path from "node:path";
import XMLWriter from "xml-writer";
import { assertIsNotNullish } from "@jaybeeuu/is";

export type ChangeFrequency =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

export interface SiteMapUrl {
  location: string;
  lastModified?: Date;
  changeFrequency?: ChangeFrequency;
  priority?: number;
}

const joinToBase = (base: string, ...pathFragments: string[]): string => {
  const url = new URL(base);
  url.pathname = path.posix.join(url.pathname, ...pathFragments);
  return url.toString();
};

interface RollupPluginSiteMapOptions {
  filename: string;
  urls: SiteMapUrl[];
  baseUrl: string;
}

const makeSiteMap = (options: {
  urls: SiteMapUrl[];
  baseUrl: string;
}): string => {
  const { urls, baseUrl } = options;

  const xml = new XMLWriter(true);
  xml.startDocument("1.0", "utf-8");
  xml.startElement("urlset");

  xml.writeAttribute("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9");
  urls.forEach((url) => {
    xml.startElement("url");
    xml.writeAttribute("loc", joinToBase(baseUrl, url.location));

    if (url.lastModified) {
      const isoDate = url.lastModified.toISOString().split("T")[0];
      assertIsNotNullish(isoDate);

      xml.writeAttribute("lastmod", isoDate);
    }
    if (url.changeFrequency) {
      xml.writeAttribute("changefreq", url.changeFrequency);
    }
    if (url.priority) {
      xml.writeAttribute("priority", `${url.priority}`);
    }
    xml.endElement();
  });

  xml.endElement();
  xml.endDocument();

  return xml.toString();
};

export const siteMap = (options: RollupPluginSiteMapOptions): Plugin => {
  return {
    name: "siteMap",

    generateBundle() {
      const siteMapString = makeSiteMap(options);

      this.emitFile({
        type: "asset",
        name: "siteMap",
        fileName: options.filename,
        source: siteMapString,
      });
    },
  };
};
