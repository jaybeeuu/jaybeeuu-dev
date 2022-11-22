export const config = {
  sourceMaps: true,
  presets: [
    ["@babel/preset-typescript", { "jsxPragma": "h" }],
    [
      "@babel/preset-env",
      {
        bugfixes: true,
        corejs: "3.26.1",
        targets: ">0.05%, not dead",
        useBuiltIns: "entry"
      }
    ]
  ],
  plugins: [
    "@babel/plugin-transform-runtime",
    ["@babel/plugin-transform-react-jsx", { pragma: "h" }]
  ]
};
