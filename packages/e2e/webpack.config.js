module.exports = {
  mode: "development",
  devtool: "eval-source-map",
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    strictExportPresence: true,
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: [/node_modules/],
        loader: require.resolve("babel-loader")
      }
    ]
  }
};