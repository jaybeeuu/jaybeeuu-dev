// @ts-check

import { Feed } from "feed";
import fs from "node:fs";
import path from "node:path";

/**
 * @typedef {import("feed").FeedOptions} FeedOptions
 * @typedef {import("feed").Item} FeedItem
 * @typedef {{
 *  atomFileName?: string;
 *  feedOptions: FeedOptions;
 *  items: FeedItem[];
 *  rssFileName?: string;
 * }} Options
 */

/**
 *
 * @param {string} destinationFileName
 * @param {string} feedString
 * @returns {Promise<void>}
 */
const writeFeed = async (destinationFileName, feedString) => {
  await fs.promises.mkdir(path.dirname(destinationFileName), {
    recursive: true,
  });
  await fs.promises.writeFile(destinationFileName, feedString, "utf-8");
};

/**
 *
 * @param {Options} options
 * @returns {Promise<void>}
 */
export const feed = async ({
  feedOptions,
  items,
  atomFileName,
  rssFileName,
}) => {
  const outputFeed = new Feed(feedOptions);

  items.forEach((item) => outputFeed.addItem(item));

  await Promise.all([
    rssFileName ? writeFeed(rssFileName, outputFeed.rss2()) : null,
    atomFileName ? writeFeed(atomFileName, outputFeed.atom1()) : null,
  ]);
};
