import { debounce, log } from "@jaybeeuu/utilities";
import chokidar from "chokidar";
import { hideBin } from "yargs/helpers";
import yargsFactory from "yargs";
import { update } from "../posts/index.js";
import type { UpdateOptions } from "../posts/src/types.js";
import type { UpdateFailureReason } from "../posts/src/update.js";
import type { Result} from "../results.js";
import { success, failure } from "../results.js";

const yargs = yargsFactory(hideBin(process.argv));

const run = async (
  options: UpdateOptions
): Promise<Result<never, "error" | UpdateFailureReason>> => {
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

const watch = (
  options: UpdateOptions
): void => {
  log.info("Starting compost in watch mode...");
  const debouncedRun = debounce(async () => {
    await run(options);
    log.info("Waiting for changes...");
  }, 250);
  const watchPaths = [
    options.sourceDir,
    ...options.additionalWatchPaths
  ].filter(Boolean);
  chokidar.watch(watchPaths).on("all", debouncedRun);
};

interface CompostCommandArgs {
  "additional-watch-paths"?: string[];
  "href-root": string;
  "manifest-file-name": string;
  "output-dir": string;
  "source-dir": string;
  "watch": boolean;
  "include-unpublished": boolean;
}

const mapArgsToOptions = (args: CompostCommandArgs): UpdateOptions => ({
  additionalWatchPaths: args["additional-watch-paths"] ?? [],
  hrefRoot: args["href-root"],
  manifestFileName: args["manifest-file-name"],
  outputDir: args["output-dir"],
  sourceDir: args["source-dir"],
  watch: args["watch"],
  includeUnpublished: args["include-unpublished"],
});

yargs.command(
  "$0",
  "Here we go!",
  {
    "href-root": {
      type: "string",
      default: "/",
      alias: ["r"],
      description: "The root path to apply when compiling hrefs (e.g. links)."
    },
    "additional-watch-paths": {
      alias: ["a"],
      description: "Paths other than --source-dir to watch when in watch mode.",
      implies: "watch",
      type: "string",
      array: true
    },
    "include-unpublished": {
      alias: ["u"],
      description: "Whether or not to compile posts not marked as published in their metadata.json file.",
      type: "boolean",
      default: false
    },
    "manifest-file-name": {
      alias: ["m"],
      description: "The nam of the output JSON manifest file.",
      type: "string",
      default: "manifest.json"
    },
    "output-dir": {
      alias: ["o"],
      description: "The directory into which the compiled files should be written.",
      type: "string",
      default: "./lib"
    },
    "source-dir": {
      alias: ["s"],
      description: "The directory containing the source files.",
      type: "string",
      default: "./src"
    },
    "watch": {
      alias: ["w"],
      description: "Watch the source files and recompile the posts when changes occur.",
      type: "boolean",
      default: false
    }
  },
  async (args) => {
    const options = mapArgsToOptions(args);
    if (options.watch) {
      watch(options);
    } else {
      const result = await run(options);

      if (result.success) {
        log.info("Success!");
        yargs.exit(0, new Error("Success!"));
      } else {
        log.info(`Failed :(\n${result.message}`);
        yargs.exit(1, result);
      }
    }
  }
);

yargs.help("help")
  .alias("h", "help")
  .showHelpOnFail(false, "Specify --help for available options");
yargs.demandCommand();
yargs.recommendCommands();
yargs.strict();
void yargs.parse();
