import type { RestEndpointMethodTypes } from "@octokit/rest";
import { Octokit } from "@octokit/rest";
import chalk from "chalk";
import type { SpawnOptions} from "node:child_process";
import child_process from "node:child_process";
import type { SimpleGit } from "simple-git";
import { simpleGit } from "simple-git";
import yargs from "yargs/yargs";

interface RunOptions {
  owner: string;
  remote: string;
  repo: string;
  base: string;
  head: string;
  token: string;
}

const makeGitHubClient = (options: RunOptions): {
  getPullsForNext: () => Promise<RestEndpointMethodTypes["pulls"]["list"]["response"]>,
  makePullForNext: () => Promise<RestEndpointMethodTypes["pulls"]["create"]["response"]>
} => {
  const octokit = new Octokit({ auth: options.token });
  return {
    getPullsForNext: () => {
      console.log("Searching for PR.");
      return octokit.pulls.list({
        base: options.base,
        head: options.head,
        owner: options.owner,
        repo: options.repo,
        state: "open"
      });
    },
    makePullForNext: () => {
      console.log("Creating PR.");
      return octokit.pulls.create({
        base: options.base,
        head: options.head,
        owner: options.owner,
        repo: options.repo,
        title: "Version packages",
        body: [
          "Automatically create PR to version the packages and create the change log.",
          "",
          "Each time a commit is made to master this PR will be updated.",
          "WHen you're ready ro release merge this PR."
        ].join("\n")
      });
    }
  };
};

const exec = (
  command: string,
  options: SpawnOptions
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const process = child_process.spawn(command, options);

    process.on("exit", (exitCode, signalCode) => {
      if ((exitCode ?? 0) > 0 || signalCode) {
        reject("Process failed.");
      } else {
        resolve();
      }
    });
  });
};

const version = async (options: RunOptions): Promise<void> => {
  console.log(chalk.green("Version Packages."));
  const git: SimpleGit = simpleGit();

  console.log(`Creating local branch ${chalk.blueBright(options.head)}.`);
  await git.checkoutLocalBranch(options.head);

  // console.log(`Resetting to ${chalk..blueBright(`${options.remote}/${options.base}`)}.`);
  // await git.reset(["--hard", `${options.remote}/${options.base}` ]);

  console.log("Versioning packages.");
  await exec(
    "pnpm changeset version",
    { shell: true, stdio: "inherit" }
  );

  console.log("Stage all files.");
  await git.add(".");

  console.log("Commit changes.");
  await git.commit("Version packages.");

  console.log("Push to origin");
  await git.push("origin", options.head, ["--force", "--set-upstream"]);

  // Create pull request if it doesn't exist
  const github = makeGitHubClient(options);

  const pull = (await github.getPullsForNext()).data[0] ?? await (() => {
    console.log("None found.");
    return github.makePullForNext();
  })();

  // log out PR URL
  console.log(`Checkout the pull request at ${chalk.green(pull.html_url)}`);
};

const assertHasToken: (
  options: Omit<RunOptions, "token"> & { token: string | undefined }
) => asserts options is RunOptions = (options) => {
  if (!options.token) {
    throw new Error("Token must be set either via the --token option or via the GITHUB_TOKEN environment variable.");
  }
};

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
