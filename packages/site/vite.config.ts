import preact from "@preact/preset-vite";
import fs from "fs";
import { defineConfig } from "vite";
2;
import { viteStaticCopy } from "vite-plugin-static-copy";
import { imagetools } from "vite-imagetools";

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
    imagetools({
      defaultDirectives: (url) => {
        if (url.searchParams.has("placeholder")) {
          return new URLSearchParams({
            w: "100",
            format: "jpg",
            blur: "0.75",
            progressive: "true",
            inline: "true",
          });
        }

        if (url.searchParams.has("background")) {
          return new URLSearchParams({
            w: "1800",
            format: "jpg",
            progressive: "true",
          });
        }

        return new URLSearchParams();
      },
    }),
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
