import getOpts from "getopts";
import { update } from "../posts";
import { UpdateOptions } from "../posts/src/types";

const options = getOpts(process.argv, {
  alias: {
    manifestFileName: "m",
    outputDir: "o",
    sourceDir: "s"
  },
  default: {
    manifestFileName: "manifest.json",
    outputDir: "./lib",
    sourceDir: "./src"
  }
}) as unknown as UpdateOptions;

update(options);
