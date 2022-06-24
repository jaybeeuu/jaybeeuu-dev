// @ts-check
const { FeedWebpackPlugin } = require("@jaybeeuu/feed-webpack-plugin");
const CaseSensitivePathsPlugin = require("case-sensitive-paths-webpack-plugin");
const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const path = require("path");
const SitemapPlugin = require("sitemap-webpack-plugin").default;
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require("webpack");
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
const { env, stringifiedEnv } = require("./config/env");
const paths = require("./config/paths");

const isProduction = env.NODE_ENV === "production";
const mode = isProduction ? "production" : "development";
const isWatching = process.argv.includes("serve");

/** @type {import("@jaybeeuu/compost").PostManifest} */
const postManifest = JSON.parse(fs.readFileSync(paths.manifest, "utf8"));

const siteURL = "https://jaybeeuu.dev";
const postsRoot = "blog";

/**
 * @param {string[]} pathFragments
 * @returns {string}
 */
const resolvedURLToSite = (...pathFragments) => {
  return path.posix.join(siteURL, ...pathFragments);
};

/** @type {import("webpack").Configuration} */
module.exports = {
  mode,
  devtool: isProduction ? "source-map" : "source-map",
  devServer: isWatching ? {
    compress: true,
    historyApiFallback: true,
    host: env.CLIENT_HOST_NAME,
    https: {
      key: fs.readFileSync(paths.certs.key),
      cert: fs.readFileSync(paths.certs.certificate)
    },
    client: {
      logging: "info",
      overlay: true,
      progress: true
    },
    port: env.CLIENT_PORT,
    static: {
      watch: true
    },
    devMiddleware: {
      stats: "normal"
    }
  } : undefined,
  entry: [
    paths.srcIndex
  ],
  output: {
    assetModuleFilename: "static/[name].[contenthash][ext]",
    clean: true,
    filename: "main.[contenthash].js",
    path: paths.dist,
    pathinfo: true,
    publicPath: "/"
  },
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"]
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        oneOf: [
          {
            test: /\.(ts|tsx|js|jsx)$/,
            include: [paths.src],
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
                    localIdentName: isProduction ? "jbw-[hash:base64:5]" : "[name]__[local]--[hash:base64:5]",
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
            type: "asset"
          },
          {
            test: [/\.(bmp|gif|jpe?g|png|svg)$/],
            type: "asset",
            use: [
              {
                loader: "image-webpack-loader",
                options: {
                  enforce: "pre",
                  bypassOnDebug: true,
                  mozjpeg: {
                    progressive: true,
                    quality: 75
                  },
                  optipng: {
                    enabled: false
                  },
                  pngquant: {
                    quality: [0.65, 0.90],
                    speed: 4
                  },
                  gifsicle: {
                    interlaced: false
                  },
                  webp: {
                    quality: 75
                  }
                }
              }
            ]
          },
          {
            exclude: [/\.(ts|tsx|js|jsx)$/, /\.css$/, /\.html$/, /\.json$/, /\.(bmp|gif|jpe?g|png|svg)$/],
            loader: "file-loader",
            options: {
              name: "static/[name].[contenthash].[ext]"
            }
          }
        ]
      }
    ]
  },
  optimization: {
    moduleIds: "deterministic",
    minimizer: [
      "...",
      new CssMinimizerPlugin(),
      new TerserPlugin({
        parallel: isProduction ? 2 : true
      })
    ],
    splitChunks: {
      maxInitialRequests: 6,
      cacheGroups: {
        slowVendors: {
          test: /[\\/]node_modules[\\/]/,
          chunks: "initial",
          filename: "slow-vendors.[contenthash].js",
          priority: -10
        },
        fastVendors: {
          test: /[\\/]lib[\\/]/,
          chunks: "initial",
          filename: "fast-vendors.[contenthash].js",
          priority: -20
        },
        default: {
          filename: "[name].[contenthash].js",
          chunks: "initial",
          priority: -30,
          reuseExistingChunk: true
        }
      }
    }
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "node_modules/@jaybeeuu/posts/lib/*",
          to: `${postsRoot}/[name][ext]`
        },
        {
          from: "public/robots.txt", to: "robots.txt"
        }
      ]
    }),
    new HtmlWebpackPlugin({
      inject: true,
      base: "/",
      template: paths.indexHtml
    }),
    new SitemapPlugin({
      base: "https://jaybeeuu.dev",
      options: {
        lastmod: true,
        changefreq: "monthly",
        priority: 0.4
      },
      paths: [
        {
          path: "/",
          priority: 0.3,
          changefreq: "yearly"
        },
        {
          path: `/${postsRoot}`,
          priority: 0.8,
          changefreq: "weekly"
        },
        ...Object.values(postManifest).map((meta) => {
          const lastmod = (meta.lastUpdateDate ?? meta.publishDate).split("T")[0];
          return {
            path: path.posix.join(postsRoot, meta.slug),
            lastmod,
            priority: 0.5,
            changefreq: "monthly"
          };
        })
      ]
    }),
    new FeedWebpackPlugin({
      atomFileName: "feeds/atom.xml",
      rssFileName: "feeds/rss.xml",
      feedOptions: {
        title: "Josh Bickley-Wallace",
        description: "Software engineering.",
        id: siteURL,
        link: siteURL,
        language: "en",
        favicon: siteURL,
        updated: new Date(
          Math.max(...Object.values(postManifest).map((meta) => {
            return +new Date(meta.publishDate);
          }))
        ),
        copyright: `All rights reserved ${new Date().getFullYear()}, Josh Bickley-Wallace`,
        feedLinks: {
          atom: resolvedURLToSite("feeds/atom.xml"),
          rss: resolvedURLToSite("feeds/rss.xml")
        },
        author: {
          name: "Josh bickley-Wallace",
          email: "joshbickleywallace@outlook.com",
          link: siteURL
        }
      },
      items: Object.values(postManifest).map(
        /**
         * @param {import("@jaybeeuu/compost").PostMetaData} meta
         * @returns {import("@jaybeeuu/feed-webpack-plugin").FeedItem}
         */
        (meta) => ({
          date: new Date(meta.publishDate),
          description: meta.abstract,
          id: meta.slug,
          link: resolvedURLToSite(postsRoot, meta.slug),
          published: new Date(meta.publishDate),
          title: meta.title
        })
      )
    }),
    new webpack.ProgressPlugin(),
    new webpack.DefinePlugin(stringifiedEnv),
    new CaseSensitivePathsPlugin(),
    isProduction ? new CleanWebpackPlugin() : null,
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      reportFilename: "bundle-report.html",
      openAnalyzer: isProduction && !isWatching
    }),
    isProduction ? new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css"
    }) : null
  ].filter(Boolean)
};
