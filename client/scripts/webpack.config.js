const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const paths = require("./paths");

const env = require("./env")();

const isDevelopment = env.raw.NODE_ENV === "development";
console.log(env.raw);

module.exports = {
  mode: isDevelopment ? "development" : "production",
  devtool: isDevelopment ? "eval-source-map" : "source-map",
  watch: isDevelopment,
  entry: [
    paths.appIndex,
  ],
  output: {
    pathinfo: true,
    path: paths.appBuild,
    filename: "bundle.js",
  },
  resolve: {
    extensions: [".js", ".jsx", "ts", "tsx"],
  },
  stats: {
    colors: true,
    children: false,
    chunks: false,
    chunkModules: false,
    modules: false
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        oneOf: [
          {
            test: [/\.bmp$/, /\.gif$/, /\.jpe?g$/, /\.png$/],
            loader: require.resolve("url-loader"),
            options: {
              limit: 10000,
              name: "static/media/[name].[hash:8].[ext]",
            },
          },
          {
            test: /\.(js|jsx|ts|tsx)$/,
            include: paths.appSrc,
            loader: require.resolve("babel-loader")
          },
          {
            test: /\.css$/,
            use: [
              "style-loader",
              {
                loader: "css-loader",
                options: {
                  modules: true,
                  localIdentName: "[name]__[local]--[hash:base64:5]",
                  camelCase: true,
                  sourceMap: true
                }
              }
            ]
          },
          {
            exclude: [/\.(js|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
            loader: require.resolve("file-loader"),
            options: {
              name: "static/media/[name].[hash:8].[ext]",
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.appHtml,
    }),
    new webpack.DefinePlugin(env.stringified),
    new webpack.NoEmitOnErrorsPlugin(),
    new CaseSensitivePathsPlugin()
  ],
};