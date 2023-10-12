import chalk from "chalk";
import { log } from "node:console";
import fs from "node:fs";
import readingTime from "reading-time";
import type { Argv } from "yargs";
import yargs from "yargs";

const getWordBoundPredicate = (
  wordBound?: string
): ((char: string) => boolean) | undefined => {
  if (wordBound === undefined) {
    return undefined;
  }

  const wordBoundRegex = new RegExp(wordBound);

  return (char: string): boolean => {
    return wordBoundRegex.test(char);
  };
};

interface CommandArguments {
  filePath: string;
  wordBound?: string;
  wordsPerMinute?: number;
  timeOnly: boolean;
  minutesOnly: boolean;
  textOnly: boolean;
}

export const main = (argv: string[]): void => {
  void yargs(argv).command<CommandArguments>(
    ["reading-time <filePath> [options]", "$0"],
    "Measure the reading time of a file.",
    (commandYarg: Argv) => commandYarg
      .positional("filePath", {
        describe: "The path to the file to read.",
        type: "string"
      })
      .option("word-bound", {
        alias: ["b"],
        describe: "A regular expression to match word boundaries.",
        type: "string"
      })
      .option("words-per-minute", {
        alias: ["p"],
        describe: "The number of words per minute to use when calculating reading time.",
        type: "number"
      })
      .options("minutes-only", {
        alias: ["m"],
        describe: "Only display the reading time (in minutes).",
        conflicts: ["time-only", "text-only"],
        type: "boolean"
      })
      .options("time-only", {
        alias: ["t"],
        describe: "Only display the reading time (in milliseconds).",
        conflicts: ["minutes-only", "text-only"],
        type: "boolean"
      })
      .options("text-only", {
        alias: ["x"],
        describe: "Only display the reading time (in milliseconds).",
        conflicts: ["minutes-only", "time-only"],
        type: "boolean"
      }),
    async ({ wordBound, wordsPerMinute, filePath, timeOnly, minutesOnly, textOnly }) => {
      const wordBoundPredicate = getWordBoundPredicate(wordBound);
      const file = await fs.promises.readFile(filePath, "utf-8");
      const result = readingTime(file, { wordBound: wordBoundPredicate, wordsPerMinute });

      switch (true) {
        case timeOnly:{
          log(result.time);
          break;
        }
        case minutesOnly: {
          log(result.minutes);
          break;
        }
        case textOnly: {
          log(result.text);
          break;
        }
        default: {
          log([
            `${chalk.bold("Reading Time")} (${filePath})`,
            "",
            `${chalk.green(result.text)} (${result.words} words)`
          ].join("\n"));
        }
      }
    }
  )
    .demandCommand()
    .help()
    .argv;
};
