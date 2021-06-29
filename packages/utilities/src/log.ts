/* eslint-disable no-console */
export const info = (message: string, ...args: unknown[]): void => console.log(message, ...args);

export const getErrorMessage = (err: any | null | undefined): string => {
  if (typeof err === "string") {
    return err || "{empty string}";
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

export const error = (...errs: unknown[]): void => {
  console.error(...errs);
};

export const warn = (message: string, ...args: unknown[]): void => {
  console.warn(message, ...args);
};
