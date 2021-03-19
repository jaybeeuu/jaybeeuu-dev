const PreactRefreshPlugin = require("@prefresh/webpack");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const { env, stringifiedEnv } = require("./config/env");
const paths = require("./config/paths");
const isProduction = env.NODE_ENV === "production";

module.exports = {
  mode: isProduction ? "production" : "development",
  devtool: isProduction ? "source-map" : "source-map",
  watch: !isProduction,
  devServer: isProduction ? undefined : {
    compress: true,
    historyApiFallback: true,
    host: env.CLIENT_HOST_NAME,
    hot: true,
    https: {
      key: fs.readFileSync(paths.certs.key),
      cert: fs.readFileSync(paths.certs.certificate),
    },
    overlay: true,
    port: env.CLIENT_PORT,
    quiet: true,
    watchContentBase: true,
    clientLogLevel: "info"
  },
  entry: [
    paths.srcIndex,
  ],
  output: {
    pathinfo: true,
    path: paths.dist,
    publicPath: "",
    filename: "main.[hash].js",
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
            test: /\.(ts|tsx|js|jsx)$/,
            include: [paths.src, /@bickley-wallace\/.*/],
            use: "babel-loader"
          },
          {
            test: /\.module\.css$/,
            use: [
              isProduction ? MiniCssExtractPlugin.loader : "style-loader",
              {
                loader: "css-modules-typescript-loader",
                options: {
                  mode: isProduction ? "verify" : "emit"
                }
              },
              {
                loader: "css-loader",
                options: {
                  modules: {
                    localIdentName: isProduction ? "bw-[hash:base64:5]" : "[name]__[local]--[hash:base64:5]",
                    exportLocalsConvention: "camelCaseOnly"
                  },
                  sourceMap: true
                }
              }
            ]
          },
          {
            test: /\.css$/,
            use: [
              isProduction ? MiniCssExtractPlugin.loader : "style-loader",
              {
                loader: "css-loader",
                options: {
                  sourceMap: true
                }
              }
            ]
          },
          {
            test: [/\.sprite.svg$/],
            use: [
              {
                loader: "url-loader",
                options: {
                  limit: 5000,
                  name: "static/[name].[hash:8].[ext]",
                },
              }
            ]
          },
          {
            test: [/\.(bmp|gif|jpe?g|png|svg)$/],
            use: [
              {
                loader: "url-loader",
                options: {
                  limit: 5000,
                  name: "static/[name].[hash:8].[ext]",
                },
              },
              {
                loader: "image-webpack-loader",
                options: {
                  enforce: "pre",
                  bypassOnDebug: true
                }
              }
            ]
          },
          {
            exclude: [/\.(ts|tsx|js|jsx)$/, /\.css$/, /\.html$/, /\.json$/, /\.(bmp|gif|jpe?g|png|svg)$/],
            loader: "file-loader",
            options: {
              name: "static/[name].[hash:8].[ext]",
            }
          }
        ]
      }
    ]
  },
  optimization: {
    minimizer: [
      "...",
      new CssMinimizerPlugin(),
      new TerserPlugin({
        parallel: isProduction ? 2 : true
      })
    ]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "node_modules/@bickley-wallace/posts/lib/*",
          to: "posts/[name].[ext]"
        }
      ]
    }),
    new HtmlWebpackPlugin({
      inject: true,
      base: "/",
      template: paths.indexHtml
    }),
    new webpack.DefinePlugin(stringifiedEnv),
    new CaseSensitivePathsPlugin(),
    new CleanWebpackPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new PreactRefreshPlugin(),
    isProduction ? new BundleAnalyzerPlugin({
      analyzerMode: "static"
    }) : null,
    isProduction ? new MiniCssExtractPlugin() : null
  ].filter(Boolean)
};
