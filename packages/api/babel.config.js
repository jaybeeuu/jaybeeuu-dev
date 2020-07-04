module.exports = (api) => {
  api.cache.using(() => process.env.NODE_ENV);

  const isTest = api.env("test");

  const ignore = isTest ? [] : ["./**/*.spec.ts"];

  return {
    sourceMaps: "inline",
    ignore,
    presets: [
      "@babel/preset-typescript",
      [
        "@babel/preset-env",
        {
          useBuiltIns: "usage",
          corejs: "3.6",
          targets: {
            node: "current"
          }
        }
      ]
    ]
  };
};