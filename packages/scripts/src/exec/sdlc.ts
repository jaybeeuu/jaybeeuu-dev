
import yargs from "yargs/yargs";

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
      async (options) => {
        const { version } = await import("../internal/sdlc.js");
        await version(options);
      }
    )
    .command(
      "publish",
      "Publish the packages whose versions have bumped & push tags to github.",
      {},
      async () => {
        const { publish } = await import("../internal/sdlc.js");
        await publish();
      }
    )
    .demandCommand()
    .help()
    .argv;
};
