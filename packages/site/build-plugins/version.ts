import { assertIsNotNullish } from "@jaybeeuu/is";
import type { Plugin } from "vite";
import shell from "shelljs";

export interface RollupPluginVersionOptions {
  fileName: string;
}

export interface Version {
  branch: string;
  commit: string;
  commitDateTime: string;
  buildMode: "production" | "development";
}

const getGitVersionObject = (): Pick<
  Version,
  "branch" | "commit" | "commitDateTime"
> => {
  const [commit, commitDateTime] = shell
    .exec('git log -1 --format="%H; %ad"')
    .trim()
    .split("; ");
  assertIsNotNullish(commit);
  assertIsNotNullish(commitDateTime);

  const branch = shell.exec("git rev-parse --abbrev-ref HEAD").trim();

  return {
    branch,
    commit,
    commitDateTime,
  };
};

export const version = (options: RollupPluginVersionOptions): Plugin => {
  return {
    name: "version",
    generateBundle() {
      const ver = JSON.stringify(
        {
          ...getGitVersionObject(),
          buildMode: this.meta.watchMode ? "development" : "production",
        },
        null,
        2,
      );
      this.emitFile({
        type: "asset",
        name: "version",
        fileName: options.fileName,
        source: ver,
      });
    },
  };
};
