// eslint-disable-next-line no-console
export const info = (message: string, ...args: unknown[]): void => console.log(message, ...args);

const getErrorMessage = (err: any | null | undefined): string => {
  if (!err) {
    return JSON.stringify(err) || "Empty string";
  }

  if (typeof err === 'string') {
    return err;
  }

  return `${err.message ?? JSON.stringify(err)}\n\n${err.stack ?? "Error: No stack."}`;
};

// eslint-disable-next-line no-console
export const error = (message:string, err?: unknown): void => {
  const errorMessage = getErrorMessage(err);

  console.error(`${message}: ${errorMessage}`);
}
