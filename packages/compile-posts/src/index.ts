import getOpts from "getopts";
import { update } from "./posts";
import { UpdateOptions } from "./posts/src/types";

const options = getOpts(process.argv, {
  alias: {
    souurceDir: "s",
    outputDir: "o",
    manifestFileName: "m"
  },
  default: {
    souurceDir: ".",
    outputDir: "./lib",
    manifestFileName: "post-manifest.json"
  }
}) as unknown as UpdateOptions;

update(options);
