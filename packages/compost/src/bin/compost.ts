import getOpts from "getopts";
import { update } from "../posts";
import { UpdateOptions } from "../posts/src/types";

const options = getOpts(process.argv, {
  alias: {
    manifestFileName: "m",
    outputDir: "o",
    souurceDir: "s"
  },
  default: {
    manifestFileName: "post-manifest.json",
    outputDir: "./lib",
    souurceDir: "./src"
  }
}) as unknown as UpdateOptions;

update(options);
