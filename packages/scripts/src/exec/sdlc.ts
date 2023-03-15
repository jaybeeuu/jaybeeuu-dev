
import yargs from "yargs/yargs";
import { publish, version } from "../internal/sdlc.js";

export const main = (): void => {
  void yargs(process.argv.slice(2))
    .command(
      "version",
      "Version packages, create change log & create pull request.",
      {
        base: {
          default: "main",
          type: "string"
        },
        "git-hub-token": {
          type: "string",
          demand: true
        },
        head: {
          default: "next",
          type: "string"
        },
        owner: {
          default: "jaybeeuu",
          type: "string"
        },
        remote: {
          default: "origin",
          type: "string"
        },
        repo: {
          default: "jaybeeuu-dev",
          type: "string"
        },
        user: {
          default: "jaybeeuu",
          type: "string"
        }
      },
      (options) => version(options)
    )
    .command(
      "publish",
      "Publish the packages whose versions have bumped & push tags to github.",
      {},
      () => publish()
    )
    .demandCommand()
    .help()
    .argv;
};
