// @ts-check
import fs from "node:fs";
import path from "node:path";
import XMLWriter from "xml-writer";

/**
 * @typedef {
 * | "always"
 * | "hourly"
 * | "daily"
 * | "weekly"
 * | "monthly"
 * | "yearly"
 * | "never"
 * } ChangeFrequency
 */

/**
 * @typedef {{
 *   location: string;
 *   lastModified?: Date;
 *   changeFrequency?: ChangeFrequency;
 *   priority?: number;
 * }} SiteMapUrl
 */

/**
 *
 * @param {string} base
 * @param {...string} pathFragments
 * @returns {string}
 */
const joinToBase = (base, ...pathFragments) => {
  const url = new URL(base);
  url.pathname = path.posix.join(url.pathname, ...pathFragments);
  return url.toString();
};

/**
 * @param {{ siteMapFilename: string; urls: SiteMapUrl[]; baseUrl: string }} options
 * @returns {Promise<void>}
 */
export const siteMap = async ({ urls, siteMapFilename, baseUrl }) => {
  await fs.promises.mkdir(path.dirname(siteMapFilename), { recursive: true });

  const xml = new XMLWriter(true);
  xml.startDocument("1.0", "utf-8");
  xml.startElement("urlset");

  xml.writeAttribute("xmlns", "http://www.sitemaps.org/schemas/sitemap/0.9");
  urls.forEach((url) => {
    xml.startElement("url");
    xml.writeAttribute("loc", joinToBase(baseUrl, url.location));

    if (url.lastModified) {
      xml.writeAttribute(
        "lastmod",
        url.lastModified.toISOString().split("T")[0]
      );
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
  await fs.promises.writeFile(siteMapFilename, xml.toString(), "utf-8");
};
