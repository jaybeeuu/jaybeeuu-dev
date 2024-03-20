import yargs from "yargs";
import { waitUp } from "../internal/wait-up.js";

export const main = (argv: string[]): void => {
  void yargs(argv)
    .command(
      ["$0", "wait"],
      "Wait for the version to match the expected commit hash.",
      {
        url: {
          description: "The URL of the version.json file to poll.",
          default: "https://127.0.0.1:3443/version.json",
          alias: "u",
          type: "string",
        },
        commitHash: {
          description: "The commit hash to wait for.",
          alias: "c",
          type: "string",
          required: true,
        },
        pollTime: {
          description: "Number of milliseconds between polls.",
          alias: "p",
          type: "number",
          default: 1 * 1000,
        },
        timeoutDelay: {
          description:
            "Time, in milliseconds to wait for the service to come up.",
          alias: "t",
          type: "number",
          default: 5 * 60 * 1000,
        },
        insecureSSL: {
          description:
            "Causes the version to be fetch, without validating SSL certs. Recommended for local development only.",
          type: "boolean",
          default: false,
        },
      },
      async (args) => {
        await waitUp(args);
      },
    )
    .demandCommand()
    .help().argv;
};
