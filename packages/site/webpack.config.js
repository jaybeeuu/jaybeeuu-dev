// @ts-check

import { FeedWebpackPlugin } from "@jaybeeuu/feed-webpack-plugin";
import { default as CaseSensitivePathsPlugin } from "case-sensitive-paths-webpack-plugin";
import { CleanWebpackPlugin } from "clean-webpack-plugin";
import CopyWebpackPlugin from "copy-webpack-plugin";
import CssMinimizerPlugin from "css-minimizer-webpack-plugin";
import fs from "fs";
import { GitRevisionPlugin } from "git-revision-webpack-plugin";
import HtmlWebpackPlugin from "html-webpack-plugin";
import ImageMinimizerPlugin from "image-minimizer-webpack-plugin";
import MiniCssExtractPlugin from "mini-css-extract-plugin";
import path from "path";
import SitemapPluginImport from "sitemap-webpack-plugin";
import TerserPlugin from "terser-webpack-plugin";
import webpack from "webpack";
import { BundleAnalyzerPlugin } from "webpack-bundle-analyzer";
import { config as babelConfig } from "./config/babel.js";
import { env, stringifiedEnv } from "./config/env.js";
import { paths } from "./config/paths.js";
// @ts-expect-error
import sharpAdapter from "responsive-loader/sharp.js";

/** @type {typeof SitemapPluginImport} */
// @ts-expect-error
const SitemapPlugin = SitemapPluginImport.default;

/** @type {webpack.WebpackPluginInstance} */
// @ts-expect-error
const caseSensitivePathsPlugin = new CaseSensitivePathsPlugin();
const gitRevisionPlugin = new GitRevisionPlugin({
  branch: true
});

const isProduction = env.NODE_ENV === "production";
/** @type {"production" | "development"} */
const mode = isProduction ? "production" : "development";
const isWatching = process.argv.includes("serve");

/** @type {import("@jaybeeuu/compost").PostManifest} */
const postManifest = JSON.parse(fs.readFileSync(paths.manifest, "utf8"));

const siteURL = "https://jaybeeuu.dev";
const postsRoot = "blog";

/** @type {<Value>(candidate: Value) => candidate is Exclude<Value, null | undefined>} */
const isNotNullish = (candidate) => !!candidate;

/**
 * @param {string[]} pathFragments
 * @returns {string}
 */
const resolvedURLToSite = (...pathFragments) => {
  return path.posix.join(siteURL, ...pathFragments);
};

/** @typedef {import('webpack-dev-server')} */
/** @type {import("webpack").Configuration} */
export default {
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
  entry: {
    main: paths.srcIndex
  },
  output: {
    assetModuleFilename: "static/[name].[contenthash][ext]",
    clean: true,
    filename: "main.[contenthash].js",
    path: paths.dist,
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
            test: /\.(ts|tsx|js|jsx|mjs)$/,
            include: [paths.src],
            use: {
              loader: "babel-loader",
              options: {
                cacheDirectory: true,
                ...babelConfig
              }
            }
          },
          {
            test: /\.module\.css$/,
            use: [
              isProduction ? MiniCssExtractPlugin.loader : "style-loader",
              {
                loader: "css-modules-typescript-loader",
                options: {
                  mode: isProduction ? "verify" : "emit",
                  modules: true
                }
              },
              {
                loader: "css-loader",
                options: {
                  modules: {
                    localIdentName: isProduction
                      ? "jbw-[hash:base64:5]"
                      : "[name]__[local]--[hash:base64:5]",
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
            test: /\.jpg$/i,
            use: [
              {
                loader: "responsive-loader",
                options: {
                  adapter: sharpAdapter,
                  format: "webp",
                  sizes: [160, 800, 1800],
                  placeholder: true,
                  placeholderSize: 40,
                  progressive: true
                }
              }
            ]
          },
          {
            test: [/\.(bmp|gif|jpe?g|png|svg)$/],
            type: "asset"
          },
          {
            exclude: [/\.(ts|tsx|js|jsx|mjs)$/, /\.css$/, /\.html$/, /\.json$/, /\.(bmp|gif|jpe?g|png|svg)$/],
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
    moduleIds: isProduction ? "deterministic" : "named",
    minimize: true,
    minimizer: [
      "...",
      new CssMinimizerPlugin(),
      new TerserPlugin({
        parallel: isProduction ? 2 : true
      }),
      new ImageMinimizerPlugin({
        minimizer: [
          {
            implementation: ImageMinimizerPlugin.sharpMinify,
            options: {
              // https://sharp.pixelplumbing.com/api-output
              encodeOptions: {
                jpeg: {
                  progressive: true,
                  optimiseScans: true
                },
                png: {
                  progressive: true
                }
              }
            }
          },
          {
            implementation: ImageMinimizerPlugin.svgoMinify,
            filter: (source, sourcePath) => !(/\.sprite\.svg$/i.test(sourcePath)),
            options: {
              encodeOptions: {
                multipass: true,
                plugins: [
                  "preset-default"
                ]
              }
            }
          }
        ]
      })
    ],
    splitChunks: {
      maxInitialRequests: 6,
      minSize: 10000,
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
    gitRevisionPlugin,
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "node_modules/@jaybeeuu/posts/lib/*",
          to: `${postsRoot}/[name][ext]`
        },
        {
          from: "public/robots.txt",
          to: "robots.txt"
        },
        {
          from: "public/version.json",
          to: "version.json",
          transform: () => {
            return JSON.stringify({
              branch: gitRevisionPlugin.branch(),
              commit: gitRevisionPlugin.commithash(),
              commitDateTime: gitRevisionPlugin.lastcommitdatetime(),
              buildMode: mode
            });
          }
        }
      ]
    }),
    new HtmlWebpackPlugin({
      inject: "body",
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
    caseSensitivePathsPlugin,
    isProduction ? new CleanWebpackPlugin() : null,
    new BundleAnalyzerPlugin({
      analyzerMode: "static",
      reportFilename: "bundle-report.html",
      openAnalyzer: isProduction && !isWatching
    }),
    isProduction ? new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css"
    }) : null
  ].filter(isNotNullish)
};
