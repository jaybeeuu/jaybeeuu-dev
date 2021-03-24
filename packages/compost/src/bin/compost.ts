import { debounce, log } from "@bickley-wallace/utilities";
import chokidar from "chokidar";
import getOpts from "getopts";
import { update } from "../posts";
import { UpdateOptions } from "../posts/src/types";
import { UpdateFailureReason } from "../posts/src/update";
import { Result, success, failure } from "../results";

const options = getOpts(process.argv, {
  alias: {
    additionalWatchPaths: "a",
    hrefRoot: "h",
    manifestFileName: "m",
    outputDir: "o",
    sourceDir: "s",
    watch: "w",
    includeUnpublished: "u"
  },
  default: {
    additionalWatchPaths: "",
    hrefRoot: "/",
    manifestFileName: "manifest.json",
    outputDir: "./lib",
    sourceDir: "./src",
    watch: false,
    includeUnpublished: false
  }
}) as unknown as UpdateOptions;

const run = async (): Promise<Result<never, "error" | UpdateFailureReason>> => {
  try {
    log.info("Composting...");
    const result = await update(options);
    if (result.success) {
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
    return failure( "error", log.getErrorMessage(err));
  }
};

const watch = (): void => {
  log.info("Starting compost in watch mode...");
  const debouncedRun = debounce(async () => {
    await run();
    log.info("Waiting for changes...");
  }, 250);
  const watchPaths = [
    options.sourceDir,
    ...options.additionalWatchPaths.split(",").map((path) => path.trim())
  ].filter(Boolean);
  chokidar.watch(watchPaths).on("all", debouncedRun);
};

if (options.watch) {
  void watch();
} else {
  void (async () => {
    const result = await run();
    process.exit(
      result.success ? 0 : 1
    );
  })();
}
