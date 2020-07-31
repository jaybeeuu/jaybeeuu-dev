import chokidar from "chokidar";
import getOpts from "getopts";
import * as log from "../log";
import { update } from "../posts";
import { UpdateOptions } from "../posts/src/types";
import debounce from "../utility/debounce";

const options = getOpts(process.argv, {
  alias: {
    manifestFileName: "m",
    outputDir: "o",
    sourceDir: "s",
    watch: "w"
  },
  default: {
    manifestFileName: "manifest.json",
    outputDir: "./lib",
    sourceDir: "./src",
    watch: false
  }
}) as unknown as UpdateOptions;

if (options.watch) {
  log.info("Starting compost in watch mode...");
  chokidar.watch(options.sourceDir).on("all", debounce(() => {
    log.info("Rebuilding posts...", );
    update(options);
  }, 250));
} else {
  log.info("Composting...");
  update(options);
}
