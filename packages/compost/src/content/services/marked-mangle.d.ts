import type { MarkedExtension } from "marked";

declare module "marked-mangle" {
  export function mangle(): MarkedExtension;
}
