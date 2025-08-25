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
  const generateFeeds = (): { rss: string | null; atom: string | null } => {
    const outputFeed = new Feed(options.feedOptions);
    options.items.forEach((item) => outputFeed.addItem(item));
    return {
      rss: options.rssFileName ? outputFeed.rss2() : null,
      atom: options.atomFileName ? outputFeed.atom1() : null,
    };
  };

  return {
    name: "feed",
    configureServer(server) {
      // Generate feeds in dev mode
      const feeds = generateFeeds();

      server.middlewares.use((req, res, next) => {
        if (
          options.rssFileName &&
          req.url === "/" + options.rssFileName &&
          feeds.rss
        ) {
          res.setHeader("Content-Type", "application/xml");
          res.end(feeds.rss);
          return;
        }
        if (
          options.atomFileName &&
          req.url === "/" + options.atomFileName &&
          feeds.atom
        ) {
          res.setHeader("Content-Type", "application/xml");
          res.end(feeds.atom);
          return;
        }
        next();
      });
    },
    generateBundle() {
      const feeds = generateFeeds();

      if (options.rssFileName && feeds.rss) {
        this.emitFile({
          type: "asset",
          name: options.rssFileName,
          fileName: options.rssFileName,
          source: feeds.rss,
        });
      }

      if (options.atomFileName && feeds.atom) {
        this.emitFile({
          type: "asset",
          name: options.atomFileName,
          fileName: options.atomFileName,
          source: feeds.atom,
        });
      }
    },
  };
};
