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
          return `    ${slug}: ${postMeta?.fileName ?? "{no meta data}"}`;
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

yargs.command(
  "$0",
  "Here we go!",
  {
    "hrefRoot": {
      type: "string",
      default: "/",
      alias: ["r"],
      description: "The root path to apply when compiling hrefs (e.g. links)."
    },
    "additionalWatchPaths": {
      alias: ["a"],
      description: "Paths other than --source-dir to watch when in watch mode.",
      implies: "watch",
      type: "string",
      array: true
    },
    "includeUnpublished": {
      alias: ["u"],
      description: "Whether or not to compile posts not marked as published in their metadata.json file.",
      type: "boolean",
      default: false
    },
    "manifestFileName": {
      alias: ["m"],
      description: "The nam of the output JSON manifest file.",
      type: "string",
      default: "manifest.json"
    },
    "codeLineNumbers": {
      description: "Include tags and classes in code blocks that can be styled to show line numbers with the Prism line number styles.",
      type: "boolean",
      default: false
    },
    "oldManifestLocator": {
      alias: ["oml"],
      description: "The path or URL of the old manifest. If none is given then the output-dir and manifest-file-name options will be used to infer the location. If this option is given and no manifest is found compost will fail.",
      type: "string",
      array: true
    },
    "outputDir": {
      alias: ["o"],
      description: "The directory into which the compiled files should be written.",
      type: "string",
      default: "./lib"
    },
    "requireOldManifest": {
      alias: ["rom"],
      description: "Indicates whether the process will fail if the old manifest is not found.",
      type: "boolean",
      default: false
    },
    "sourceDir": {
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
  async (rawOptions) => {
    const options: UpdateOptions = {
      ...rawOptions,
      oldManifestLocators: rawOptions.oldManifestLocator ?? [],
      additionalWatchPaths: rawOptions.additionalWatchPaths ?? [],
    };

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
