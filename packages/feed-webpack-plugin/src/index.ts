import type { FeedOptions, Item as FeedItem } from "feed";
import { Feed } from "feed";
import type { Compiler} from "webpack";
import { Compilation, sources } from "webpack";

export { FeedItem, FeedOptions };

export interface FeedWebpackPluginOptions {
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

export class FeedWebpackPlugin {
  private readonly options;

  constructor(options: FeedWebpackPluginOptions) {
    this.options = options;
  }

  run(compilation: Compilation): Promise<void> {
    const feed = new Feed(this.options.feedOptions);

    this.options.items.forEach((item) => feed.addItem(item));

    if (this.options.rssFileName) {
      compilation.emitAsset(
        this.options.rssFileName,
        new sources.RawSource(feed.rss2())
      );
    }

    if (this.options.atomFileName) {
      compilation.emitAsset(
        this.options.atomFileName,
        new sources.RawSource(feed.atom1())
      );
    }

    return Promise.resolve();
  }

  apply(compiler: Compiler): void {
    if (compiler?.webpack.version[0] !== "5") {
      throw new Error("Unsupported webpack version; must be 5");
    }
    const pluginName = FeedWebpackPlugin.name;

    compiler.hooks.thisCompilation.tap(pluginName, (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: pluginName,
          stage: Compilation.PROCESS_ASSETS_STAGE_SUMMARIZE
        },
        () => this.run(compilation)
      );
    });
  }
}
