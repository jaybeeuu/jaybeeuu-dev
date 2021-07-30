const PreactRefreshPlugin = require("@prefresh/webpack");
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
const isWatching = process.argv.includes("serve");

/** @type {import("@jaybeeuu/compost").PostManifest} */
const postManifest = JSON.parse(fs.readFileSync(paths.manifest));

/** @type {import("webpack").Configuration} */
module.exports = {
  mode: isProduction ? "production" : "development",
  devtool: isProduction ? "source-map" : "source-map",
  devServer: isWatching ? {
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
    watchContentBase: true,
    stats: "normal"
  } : undefined,
  entry: [
    paths.srcIndex,
  ],
  output: {
    pathinfo: true,
    path: paths.dist,
    publicPath: "/",
    filename: "main.[contenthash].js",
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
            include: [paths.src, /@jaybeeuu\/.*/],
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
                  name: "static/[name].[contenthash].[ext]",
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
                  name: "static/[name].[contenthash].[ext]",
                },
              },
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
                    enabled: false,
                  },
                  pngquant: {
                    quality: [0.65, 0.90],
                    speed: 4
                  },
                  gifsicle: {
                    interlaced: false,
                  },
                  // the webp option will enable WEBP
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
              name: "static/[name].[contenthash].[ext]",
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
          priority: -10,
        },
        fastVendors: {
          test: /[\\/]lib[\\/]/,
          chunks: "initial",
          filename: "fast-vendors.[contenthash].js",
          priority: -20,
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
          to: "posts/[name][ext]"
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
          changefreq: "yearly",
        },
        {
          path: "/posts",
          priority: 0.8,
          changefreq: "weekly"
        },
        ...Object.values(postManifest).map((meta) => {
          const lastmod = (meta.lastUpdateDate ?? meta.publishDate).split("T")[0];
          return {
            path: path.posix.join("/posts", meta.slug),
            lastmod,
            priority: 0.5,
            changefreq: "monthly"
          };
        })
      ],
    }),
    new webpack.DefinePlugin(stringifiedEnv),
    new CaseSensitivePathsPlugin(),
    isProduction ? new CleanWebpackPlugin() : null,
    !isProduction ? new webpack.HotModuleReplacementPlugin() : null,
    !isProduction ? new PreactRefreshPlugin() : null,
    isProduction && !isWatching ? new BundleAnalyzerPlugin({
      analyzerMode: "static",
      reportFilename: "bundle-report.html"
    }) : null,
    isProduction ? new MiniCssExtractPlugin({
      filename: "[name].[contenthash].css"
    }) : null
  ].filter(Boolean)
};
