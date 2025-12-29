import { createCompostConfig } from "@jaybeeuu/compost/config";
import { config as postsConfig } from "@jaybeeuu/posts/config";

export const config = createCompostConfig("post", {
  ...postsConfig,
  sourceDir: "./fixtures/src/blog",
  outputDir: "./fixtures/blog",
});

export default config;
