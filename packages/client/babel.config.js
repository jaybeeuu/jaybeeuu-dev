module.exports = (api) => {
  api.cache.using(() => process.env.NODE_ENV);

  return {
    sourceMaps: true,
    presets: [
      ["@babel/preset-typescript", { "jsxPragma": "h" }],
      [
        "@babel/preset-env",
        {
          useBuiltIns: "usage",
          corejs: "3.6",
          targets: "> 0.25%, not dead",
          modules: "commonjs"
        }
      ]
    ],
    plugins: [
      ["@babel/plugin-transform-react-jsx", { pragma: "h" }]
    ]
  };
};
