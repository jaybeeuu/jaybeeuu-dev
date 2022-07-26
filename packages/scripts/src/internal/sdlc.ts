import type { RestEndpointMethodTypes } from "@octokit/rest";
import { Octokit } from "@octokit/rest";
import chalk from "chalk";
import type { SpawnOptions} from "node:child_process";
import child_process from "node:child_process";
import type { SimpleGit } from "simple-git";
import { simpleGit } from "simple-git";

export interface GitHubClientOptions {
  base: string;
  gitHubToken: string;
  head: string;
  owner: string;
  remote: string;
  repo: string;
  user: string;
}

class GitHubClient {
  readonly #options: GitHubClientOptions;
  readonly #octokit: Octokit;
  constructor(options: GitHubClientOptions) {
    this.#options = options;
    this.#octokit = new Octokit({ auth: options.gitHubToken });
  }

  #getPullsForNext(): Promise<RestEndpointMethodTypes["pulls"]["list"]["response"]> {
    const searchOptions: RestEndpointMethodTypes["pulls"]["list"]["parameters"] = {
      base: this.#options.base,
      head: `${this.#options.user}:${this.#options.head}`,
      owner: this.#options.owner,
      repo: this.#options.repo,
      state: "open"
    };
    console.log("Searching for PR.", searchOptions);
    return this.#octokit.pulls.list(searchOptions);
  }
  #makePullForNext(): Promise<RestEndpointMethodTypes["pulls"]["create"]["response"]> {
    const createPrOptions: RestEndpointMethodTypes["pulls"]["create"]["parameters"] = {
      base: this.#options.base,
      head: this.#options.head,
      owner: this.#options.owner,
      repo: this.#options.repo,
      title: "Version packages",
      body: [
        "***Do not edit this PR directly - it is automatically generated.***",
        "",
        "The packages have all been versioned and the change logs created for all unpublished the changes on master.",
        "When you're ready ro release merge this PR.",
        "",
        "Each time a commit is made to master this PR will be updated."
      ].join("\n")
    };
    console.log("Creating PR.", createPrOptions);
    const response = this.#octokit.pulls.create(createPrOptions);
    console.log(response);
    return response;
  }

  async getOrCreatePullForNext(): Promise<{ html_url: string }> {
    const pull = (await this.#getPullsForNext()).data[0];

    if (pull) {
      return pull;
    }

    console.log("None found.");
    const createResponse = await this.#makePullForNext();

    return createResponse.data;
  }
}

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

export const version = async (options: GitHubClientOptions): Promise<void> => {
  console.log(chalk.green("Version Packages."));
  const git: SimpleGit = simpleGit();

  console.log(`Creating local branch ${chalk.blueBright(options.head)}.`);
  await git.checkoutLocalBranch(options.head);

  console.log("Versioning packages.");
  await executeCommand(
    "pnpm changeset version",
    { shell: true, stdio: "inherit" }
  );

  console.log("Stage all files.");
  await git.add(".");

  console.log("Update pnpm-lock.");
  child_process.spawnSync("pnpm -r install");

  console.log("Commit changes.");
  await git.commit("Version packages.");

  console.log(`Push to ${chalk.blueBright(options.remote)}/${chalk.blueBright(options.head)}`);
  await git.push(["--force", "--set-upstream", options.remote, options.head]);

  const github = new GitHubClient(options);

  const pull = await github.getOrCreatePullForNext();

  console.log(`Checkout the pull request at ${chalk.green(pull.html_url)}`);
};

export const publish = async (): Promise<void> => {
  const git: SimpleGit = simpleGit();

  await executeCommand(
    "pnpm changeset publish",
    { shell: true, stdio: "inherit" }
  );

  await git.pushTags();
};
