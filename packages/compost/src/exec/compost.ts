import type { Result } from "@jaybeeuu/utilities";
import { debounce, failure, log, success } from "@jaybeeuu/utilities";
import chokidar from "chokidar";
import yargsFactory from "yargs";
import { hideBin } from "yargs/helpers";
import { processContent } from "../content/index.js";

/**
 * Configuration options for the compost CLI.
 */
export interface UpdateOptions {
  additionalWatchPaths: string[];
  hrefRoot: string;
  includeUnpublished: boolean;
  codeLineNumbers: boolean;
  manifestFileName: string;
  oldManifestLocators: string[];
  outputDir: string;
  requireOldManifest: boolean;
  sourceDir: string;
  watch: boolean;
  removeH1: boolean;
  clean: boolean;
}

const yargs = yargsFactory(hideBin(process.argv));

const run = async (
  options: UpdateOptions,
): Promise<Result<never, "error" | string>> => {
  try {
    log.info("Composting...");
    const result = await processContent(options);
    if (result.success) {
      // Format output for all content types
      const outputLines = Object.entries(result.value.manifests)
        .filter(([, manifest]) => Object.keys(manifest).length > 0)
        .flatMap(([contentType, manifest]) => {
          const contentTypeHeader = `  ${contentType}:`;
          const manifestLines = Object.entries(manifest).map(([slug, meta]) => {
            const fileName =
              (meta as { fileName?: string }).fileName ?? "unknown";
            return `    ${slug}: ${fileName}`;
          });
          return [contentTypeHeader, ...manifestLines];
        });

      log.info(
        `Complete:\n\n${outputLines.join("\n") || "  No content processed"}`,
      );
      return success();
    } else {
      log.error(`Failed to compost: ${result.message}`);
      return result;
    }
  } catch (err) {
    log.error("Failed to compost", err);
    return failure("error", log.getErrorMessage(err));
  }
};

const watch = (options: UpdateOptions): void => {
  log.info("Starting compost in watch mode...");
  const debouncedRun = debounce(async () => {
    await run(options);
    log.info("Waiting for changes...");
  }, 250);
  const watchPaths = [
    options.sourceDir,
    ...options.additionalWatchPaths,
  ].filter(Boolean);
  chokidar.watch(watchPaths).on("all", debouncedRun);
};

yargs.command(
  "$0",
  "Here we go!",
  {
    hrefRoot: {
      type: "string",
      default: "/",
      alias: ["r"],
      description: "The root path to apply when compiling hrefs (e.g. links).",
    },
    additionalWatchPaths: {
      alias: ["a"],
      description: "Paths other than --source-dir to watch when in watch mode.",
      implies: "watch",
      type: "string",
      array: true,
    },
    includeUnpublished: {
      alias: ["u"],
      description:
        "Whether or not to compile posts not marked as published in their metadata.json file.",
      type: "boolean",
      default: false,
    },
    manifestFileName: {
      alias: ["m"],
      description: "The nam of the output JSON manifest file.",
      type: "string",
      default: "manifest.json",
    },
    codeLineNumbers: {
      description:
        "Include tags and classes in code blocks that can be styled to show line numbers with the Prism line number styles.",
      type: "boolean",
      default: false,
    },
    oldManifestLocator: {
      description:
        "The path or URL of the old manifest. If none is given then the output-dir and manifest-file-name options will be used to infer the location. If this option is given and no manifest is found compost will fail.",
      type: "string",
      array: true,
    },
    outputDir: {
      alias: ["o"],
      description:
        "The directory into which the compiled files should be written.",
      type: "string",
      default: "./lib",
    },
    removeH1: {
      description:
        "Indicates whether the process will remove H1 (#) headings. Useful if you will render that with a custom heading in your page.",
      type: "boolean",
      default: false,
    },
    requireOldManifest: {
      description:
        "Indicates whether the process will fail if the old manifest is not found.",
      type: "boolean",
      default: false,
    },
    sourceDir: {
      alias: ["s"],
      description: "The directory containing the source files.",
      type: "string",
      default: "./src",
    },
    watch: {
      alias: ["w"],
      description:
        "Watch the source files and recompile the posts when changes occur.",
      type: "boolean",
      default: false,
    },
    clean: {
      alias: ["c"],
      description: "Clean the output directory before compiling.",
      type: "boolean",
      default: false,
    },
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
  },
);

yargs
  .help("help")
  .alias("h", "help")
  .showHelpOnFail(false, "Specify --help for available options");
yargs.demandCommand();
yargs.recommendCommands();
yargs.strict();
void yargs.parse();
