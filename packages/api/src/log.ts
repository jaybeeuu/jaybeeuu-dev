// eslint-disable-next-line no-console
export const info = (...args: any[]): void => console.log(...args);

// eslint-disable-next-line no-console
export const error = (err: Error): void => console.error(
  `Error (${err.name}):\n${err.message}\n\n${err.stack}`
);
