const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack");
const { env, stringifiedEnv } = require("./env");
const paths = require("./paths");

const isProduction = env.NODE_ENV === "production";
console.log(env.CLIENT_PORT);
module.exports = {
  mode: isProduction ? "production" : "development",
  devtool: isProduction ? "source-map" : "eval-source-map",
  watch: !isProduction,
  devServer: {
    compress: true,
    contentBase: paths.appPublic,
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
  },
  entry: [
    paths.appIndex,
  ],
  output: {
    pathinfo: true,
    path: paths.appBuild,
    filename: paths.appBundle,
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
            exclude: [/\.(ts|tsx|js|jsx)$/, /\.html$/, /\.json$/],
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
    new webpack.DefinePlugin(stringifiedEnv),
    new webpack.NoEmitOnErrorsPlugin(),
    new CaseSensitivePathsPlugin(),
    new CleanWebpackPlugin()
  ]
};
