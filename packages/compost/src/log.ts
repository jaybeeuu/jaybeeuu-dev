/* eslint-disable no-console */
import chalk from "chalk";
export const info = (message: string, ...args: unknown[]): void => console.log(message, ...args);

export const getErrorMessage = (err: any | null | undefined): string => {
  if (typeof err === "string") {
    return err || "Empty String";
  }

  if (err instanceof Error) {
    return [
      err.message,
      err.stack ?? "No Stack"
    ].join("\n");
  }

  if (!err) {
    return String(err);
  }

  return JSON.stringify(err, null, 2);
};

export const error = (message:string, ...errs: unknown[]): void => {
  const errorMessages = errs.flatMap(getErrorMessage);

  console.error(chalk.red([
    message,
    ...errorMessages
  ].join("\n\n")));
};
