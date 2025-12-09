import type { Result } from "@jaybeeuu/utilities";
import { debounce, failure, log, success } from "@jaybeeuu/utilities";
import chokidar from "chokidar";
import yargsFactory from "yargs";
import { hideBin } from "yargs/helpers";
import path from "node:path";
import { pathToFileURL } from "node:url";
import type { OrchestratorConfig as OrchestratorOptions } from "../content/index.js";
import {
  processContent,
  type CompostConfig,
  validateCompostConfig,
} from "../content/index.js";

/**
 * Configuration options for the compost CLI.
 */
export interface UpdateOptions {
  /** Whether or not to clean the output directories before writing the composted files. */
  clean: boolean;
  /** The path to the config file. Will default to ./compost.config */
  config: string;
  /** Whether or not to watch for changes and recompile automatically. */
  watch: boolean;
}

const yargs = yargsFactory(hideBin(process.argv));

const loadConfig = async (configPath: string): Promise<CompostConfig> => {
  try {
    const resolvedPath = path.resolve(configPath);
    const configUrl = pathToFileURL(resolvedPath).href;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const configModule = await import(configUrl);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const config = configModule.default ?? configModule.config;

    if (!validateCompostConfig(config)) {
      throw new Error(
        "Invalid config structure: must be a CompostConfig object with valid contentTypes",
      );
    }

    return config;
  } catch (err) {
    throw new Error(
      `Failed to load config from ${configPath}: ${log.getErrorMessage(err)}`,
    );
  }
};

const run = async (
  orchestratorOptions: OrchestratorOptions,
  compostConfig: CompostConfig,
): Promise<Result<never, "content type processing failed" | "error">> => {
  try {
    log.info("Composting...");

    const result = await processContent(
      orchestratorOptions,
      compostConfig.contentTypes,
    );

    if (result.success) {
      // Format output for all content types
      const outputLines = Object.entries(result.value)
        .filter(([, manifest]) => Object.keys(manifest.entries).length > 0)
        .flatMap(([contentType, manifest]) => {
          const contentTypeHeader = `  ${contentType}:`;
          const manifestLines = Object.entries(manifest.entries).map(
            ([slug, meta]) => {
              const fileName =
                (meta as { fileName?: string }).fileName ?? "unknown";
              return `    ${slug}: ${fileName}`;
            },
          );
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

const watch = (
  orchestratorOptions: OrchestratorOptions,
  compostConfig: CompostConfig,
): void => {
  log.info("Starting compost in watch mode...");

  const debouncedRun = debounce(async () => {
    await run(orchestratorOptions, compostConfig);
    log.info("Waiting for changes...");
  }, 250);
  const watchPaths = Object.values(compostConfig.contentTypes).flatMap(
    (contentType) =>
      [contentType.sourceDir, ...contentType.additionalWatchPaths].filter(
        Boolean,
      ),
  );
  chokidar.watch(watchPaths).on("all", debouncedRun);
};

yargs.command(
  "$0",
  "Here we go!",
  {
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
    config: {
      description: "Path to the compost configuration file.",
      type: "string",
      demandOption: true,
    },
  },
  async (options: UpdateOptions) => {
    const orchestratorConfig = { clean: options.clean };
    const compostConfig = await loadConfig(options.config);

    if (options.watch) {
      watch(orchestratorConfig, compostConfig);
    } else {
      const result = await run(orchestratorConfig, compostConfig);

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
