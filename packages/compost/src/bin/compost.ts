import { debounce, log } from "@bickley-wallace/utilities";
import chokidar from "chokidar";
import getOpts from "getopts";
import { update } from "../posts";
import { UpdateOptions } from "../posts/src/types";
import { ResultState, Result, success, failure } from "../results";

const options = getOpts(process.argv, {
  alias: {
    manifestFileName: "m",
    outputDir: "o",
    sourceDir: "s",
    watch: "w",
    hrefRoot: "h"
  },
  default: {
    manifestFileName: "manifest.json",
    outputDir: "./lib",
    sourceDir: "./src",
    hrefRoot: "/",
    watch: false
  }
}) as unknown as UpdateOptions;

const run = async (): Promise<Result<void>> => {
  try {
    log.info("Composting...");
    const result = await update(options);
    if (result.state === ResultState.success) {
      log.info(`Complete:\n\n${
        Object.entries(result.value).map(([slug, postMeta]) => {
          return `    ${slug}: ${postMeta.fileName}`;
        }).join("\n")
      }`);
      return success();
    } else {
      log.error(`Failed to compost: ${result.message}`);
      return result;
    }
  } catch (err) {
    log.error("Failed to compost", err);
    return failure(log.getErrorMessage(err));
  }
};

const watch = (): void => {
  log.info("Starting compost in watch mode...");
  const debounced = debounce(async () => {
    await run();
    log.info("Waiting for changes...");
  }, 250);
  chokidar.watch(options.sourceDir).on("all", debounced);
};

if (options.watch) {
  void watch();
} else {
  void (async () => {
    const result = await run();
    process.exit(
      result.state === ResultState.success ? 0 : 1
    );
  })();
}
