import type { Result } from "@jaybeeuu/utilities";
import {
  debounce,
  failure,
  log,
  success,
  getErrorMessage,
} from "@jaybeeuu/utilities";
import chokidar from "chokidar";
import path from "node:path";
import { pathToFileURL } from "node:url";
import yargsFactory from "yargs";
import { hideBin } from "yargs/helpers";
import {
  type ContentDefinition,
  isContentDefinition,
} from "../content/content-definition.js";
import type {
  OrchestratorConfig,
  ProcessContentFailureReason,
} from "../content/orchestrator.js";
import { compost } from "../index.js";

/**
 * Configuration options for the compost CLI.
 */
export interface CliArgs {
  /** Whether or not to clean the output directories before writing the composted files. */
  clean: boolean;
  /** The path to the config file. Will default to ./compost.config */
  config: string;
  /** Whether or not to watch for changes and recompile automatically. */
  watch: boolean;
  /** Whether or not to include unpublished content in the output. */
  includeUnpublished?: boolean;
}

const yargs = yargsFactory(hideBin(process.argv));

const loadConfig = async (
  configPath: string,
  args: CliArgs,
): Promise<ContentDefinition> => {
  try {
    const resolvedPath = path.resolve(configPath);
    const configUrl = pathToFileURL(resolvedPath).href;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const configModule = await import(configUrl);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    const config = configModule.default ?? configModule.config;

    if (!isContentDefinition(config)) {
      throw new Error(
        "Invalid config structure: must be a CompostConfig object with valid contentTypes",
      );
    }

    return {
      ...config,
      ...(args.includeUnpublished !== undefined
        ? { includeUnpublished: args.includeUnpublished }
        : {}),
    };
  } catch (err) {
    throw new Error(
      `Failed to load config from ${configPath}: ${getErrorMessage(err)}`,
    );
  }
};

const run = async (
  contentDef: ContentDefinition,
  orchestratorCOnfig: OrchestratorConfig,
): Promise<Result<never, ProcessContentFailureReason | "error">> => {
  try {
    log.info("Composting...");

    const result = await compost(contentDef, orchestratorCOnfig);

    if (result.success) {
      const manifest = result.value;
      // Format output for all content types
      const outputLines = Object.entries(manifest.entries).map(
        ([slug, meta]) => {
          const fileName =
            (meta as { fileName?: string }).fileName ?? "unknown";
          return `    ${slug}: ${fileName}`;
        },
      );

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
    return failure("error", getErrorMessage(err));
  }
};

const watch = (
  contentDef: ContentDefinition,
  orchestratorConfig: OrchestratorConfig,
): void => {
  log.info("Starting compost in watch mode...");

  const debouncedRun = debounce(async () => {
    await run(contentDef, orchestratorConfig);
    log.info("Waiting for changes...");
  }, 250);
  const watchPaths = [
    contentDef.sourceDir,
    ...contentDef.additionalWatchPaths,
  ].filter(Boolean);
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
    includeUnpublished: {
      description:
        "Include unpublished content in the output (overrides content definition setting).",
      type: "boolean",
    },
  },
  async (args: CliArgs) => {
    const orchestratorConfig: OrchestratorConfig = {
      clean: args.clean,
    };

    const compostConfig = await loadConfig(args.config, args);
    if (args.watch) {
      watch(compostConfig, orchestratorConfig);
    } else {
      const result = await run(compostConfig, orchestratorConfig);

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
