# rollup-plugin-feed

[![npm](https://img.shields.io/npm/v/@jaybeeuu/rollup-plugin-feed.svg)](https://www.npmjs.com/package/@jaybeeuu/rollup-plugin-feed)

Wraps
[feed](https://github.com/jpmonette/feed#readme)
in a rollup plugin so it can be used to generate and feeds and inject them into the rollup output.

## Usage

```js
const { defineConfig } = require("rollup");
const { feed } = require("rollup-plugin-feed");
export default definedConfig(
  feed({
    atomFileName: "feeds/atom.xml", // The file name that the Atom feed should be written to. If undefined no atom feed will be emitted.
    rssFileName: "feeds/rss.xml", // The file name that the rss feed should be written to. If undefined no rss feed will be emitted.
    feedOptions: {
      /* Options used to build the feed. Passed onto new Feed. */
    },
    items: [
      /* Items to include on the feed. Passed onto feed.addItem */
    ],
  })
);
```

For more details on the options for `feedOptions` or `items` see the [feed](https://github.com/jpmonette/feed#readme) docs.
