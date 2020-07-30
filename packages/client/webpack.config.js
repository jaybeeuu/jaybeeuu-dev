const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpckPlugin = require("copy-webpack-plugin");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const { env, stringifiedEnv } = require("./config/env");
const paths = require("./config/paths");

const isProduction = env.NODE_ENV === "production";

module.exports = {
  mode: isProduction ? "production" : "development",
  devtool: isProduction ? "source-map" : "source-map",
  watch: !isProduction,
  devServer: ! isProduction ? {
    compress: true,
    host: env.CLIENT_HOST_NAME,
    hot: true,
    https: {
      key: fs.readFileSync(paths.certs.key),
      cert: fs.readFileSync(paths.certs.certificate),
    },
    overlay: true,
    port: env.CLIENT_PORT,
    quiet: true,
    watchContentBase: true
  } : undefined,
  entry: [
    paths.srcIndex,
  ],
  output: {
    pathinfo: true,
    path: paths.dist,
    filename: paths.bundle,
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
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
            test: /\.(ts|tsx|js|jsx)$/,
            include: paths.src,
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
            exclude: [/\.(ts|tsx|js|jsx)$/, /\.css$/, /\.html$/, /\.json$/],
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
    new CopyWebpckPlugin({
      patterns: [
        { from: "node_modules/@bickley-wallace/posts/lib/*", to: "posts/[name].[ext]" }
      ]
    }),
    new HtmlWebpackPlugin({
      inject: true,
      template: paths.indexHtml,
    }),
    new webpack.DefinePlugin(stringifiedEnv),
    new webpack.NoEmitOnErrorsPlugin(),
    new CaseSensitivePathsPlugin(),
    new CleanWebpackPlugin()
  ]
};
