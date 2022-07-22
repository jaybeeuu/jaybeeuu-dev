import type { RestEndpointMethodTypes } from "@octokit/rest";
import { Octokit } from "@octokit/rest";
import chalk from "chalk";
import type { SpawnOptions} from "node:child_process";
import child_process from "node:child_process";
import type { SimpleGit } from "simple-git";
import { simpleGit } from "simple-git";

export interface GitHubClientOptions {
  owner: string;
  repo: string;
  base: string;
  head: string;
  token: string;
}

const makeGitHubClient = (options: GitHubClientOptions): {
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
          "***Do not edit this PR directly - it is automatically generated.***",
          "",
          "Versions the packages and creates the change log.",
          "When you're ready ro release merge this PR.",
          "",
          "Each time a commit is made to master this PR will be updated."
        ].join("\n")
      });
    }
  };
};

const executeCommand = (
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

export interface VersionOptions extends GitHubClientOptions {
  remote: string;
}

export const version = async (options: VersionOptions): Promise<void> => {
  console.log(chalk.green("Version Packages."));
  const git: SimpleGit = simpleGit();

  console.log(`Creating local branch ${chalk.blueBright(options.head)}.`);
  await git.checkoutLocalBranch(options.head);

  console.log(`Resetting to ${chalk.blueBright(`${options.remote}/${options.base}`)}.`);
  await git.reset(["--hard", `${options.remote}/${options.base}` ]);

  console.log("Versioning packages.");
  await executeCommand(
    "pnpm changeset version",
    { shell: true, stdio: "inherit" }
  );

  console.log("Stage all files.");
  await git.add(".");

  console.log("Commit changes.");
  await git.commit("Version packages.");

  console.log("Push to origin.");
  await git.push("origin", options.head, ["--force", "--set-upstream"]);

  const github = makeGitHubClient(options);

  const pull = (await github.getPullsForNext()).data[0] ?? await (() => {
    console.log("None found.");
    return github.makePullForNext();
  })();

  console.log(`Checkout the pull request at ${chalk.green(pull.html_url)}`);
};

export const publish = async (): Promise<void> => {
  // Run Changesets Publish
  await executeCommand(
    "pnpm changeset publish",
    { shell: true, stdio: "inherit" }
  );

  // Push Tags
  const git: SimpleGit = simpleGit();
  await git.pushTags();
};
