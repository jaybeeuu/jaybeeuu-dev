import preact from "@preact/preset-vite";
import fs from "fs";
import { defineConfig } from "vite";
2;
import { viteStaticCopy } from "vite-plugin-static-copy";

const postsRoot = "blog";

/** @type {import('vite').UserConfig} */
export default defineConfig({
  css: {
    modules: {
      localsConvention: "camelCaseOnly",
    },
  },
  server: {
    port: 3443,
    https: {
      ca: fs.readFileSync("./certs/ca.pem"),
      key: fs.readFileSync("./certs/key.key"),
      cert: fs.readFileSync("./certs/cert.crt"),
    },
  },
  plugins: [
    preact(),
    viteStaticCopy({
      targets: [
        {
          src: "node_modules/@jaybeeuu/posts/lib/*",
          dest: postsRoot,
        },
      ],
    }),
  ],
});
