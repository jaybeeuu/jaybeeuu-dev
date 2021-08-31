# feed-webpack-plugin

Wraps
[feed](https://github.com/jpmonette/feed#readme)
in a webpack plugin so it can be used to generate and feeds and inject them into the webpack output.

## Usage

```js
const { FeedWebpackPlugin } = require("@jaybeeuu/feed-webpack-plugin");
export default {
  plugins: [
    new FeedWebpackPlugin({
      atomFileName: "feeds/atom.xml", // The file name that the Atom feed should be written to. If undefined no atom feed will be emitted.
      rssFileName: "feeds/rss.xml", // The file name that the rss feed should be written to. If undefined no rss feed will be emitted.
      feedOptions: { /* Options used to build the feed. Passed onto new Feed. */ },
      items: [ /* Items to include on the feed. Passed onto feed.addItem */]
    })
```

For more details on the options for `feedOptions` or `items` see the [feed](https://github.com/jpmonette/feed#readme) docs.
