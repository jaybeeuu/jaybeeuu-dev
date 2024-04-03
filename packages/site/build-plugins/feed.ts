import type { FeedOptions, Item as FeedItem } from "feed";
import type { Plugin } from "vite";
import { Feed } from "feed";

export { FeedItem, FeedOptions };

export interface RollupPluginFeedOptions {
  /**
   * The file name that the Atom feed should be written to. If undefined no atom feed will be emitted.
   */
  atomFileName?: string;
  /**
   * Options used to build the feed. Passed onto new Feed.
   */
  feedOptions: FeedOptions;
  /**
   * Items to include on the feed. Passed onto feed.addItem
   */
  items: FeedItem[];
  /**
   * The file name that the rss feed should be written to. If undefined no rss feed will be emitted.
   */
  rssFileName?: string;
}

export const feed = (options: RollupPluginFeedOptions): Plugin => {
  return {
    name: "feed",
    generateBundle() {
      const outputFeed = new Feed(options.feedOptions);

      options.items.forEach((item) => outputFeed.addItem(item));

      if (options.rssFileName) {
        this.emitFile({
          type: "asset",
          name: options.rssFileName,
          fileName: options.rssFileName,
          source: outputFeed.rss2(),
        });
      }

      if (options.atomFileName) {
        this.emitFile({
          type: "asset",
          name: options.atomFileName,
          fileName: options.atomFileName,
          source: outputFeed.atom1(),
        });
      }
    },
  };
};
