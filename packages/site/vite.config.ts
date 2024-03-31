import preact from "@preact/preset-vite";
import fs from "node:fs";
import { defineConfig } from "vite";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { imagetools } from "vite-imagetools";
import { paths } from "./config/paths";

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
          dest: paths.postsRoot,
        },
      ],
    }),
  ],
});
