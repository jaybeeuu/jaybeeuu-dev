/* eslint-disable no-console */
import chalk from "chalk";
export const info = (message: string, ...args: unknown[]): void => console.log(message, ...args);

const getErrorMessage = (err: any | null | undefined): string | string[] => {
  if (typeof err === "string") {
    return err || "Empty String";
  }

  if (err instanceof Error) {
    return [
      err.message,
      err.stack ?? "No Stack"
    ];
  }

  if (!err) {
    return String(err);
  }

  return JSON.stringify(err, null, 2);
};

export const error = (message:string, ...errs: unknown[]): void => {
  const errorMessages = errs.flatMap(getErrorMessage);

  console.error([
    message,
    ...errorMessages
  ].map((msg) => chalk.red(msg)).join("\n\n"));
};
