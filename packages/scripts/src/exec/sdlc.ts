import yargs from "yargs/yargs";
import type { VersionOptions } from "../internal/sdlc.js";
import { version } from "../internal/sdlc.js";

const assertHasToken: (
  options: Omit<VersionOptions, "token"> & { token: string | undefined }
) => asserts options is VersionOptions = (options) => {
  if (!options.token) {
    throw new Error("Token must be set either via the --token option or via the GITHUB_TOKEN environment variable.");
  }
};

export const main = (): void => {
  void yargs(process.argv.slice(2))
    .command(
      "version",
      "Version packages, create change log & create pull request.",
      {
        base: {
          default: "main",
          alias: "b",
          type: "string"
        },
        head: {
          default: "next",
          alias: "h",
          type: "string"
        },
        owner: {
          default: "jaybeeuu",
          alias: "o",
          type: "string"
        },
        repo: {
          default: "jaybeeuu-dev",
          alias: "r",
          type: "string"
        },
        remote: {
          default: "origin",
          type: "string"
        },
        token: {
          alias: "t",
          type: "string",
          default: process.env.GITHUB_TOKEN
        }
      }, async (options) => {
        assertHasToken(options);
        await version(options);
      }
    )
    .demandCommand()
    .help()
    .argv;
};
