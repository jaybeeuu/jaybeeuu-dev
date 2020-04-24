// eslint-disable-next-line no-console
const info = (...args: any[]): void => console.log(...args);

// eslint-disable-next-line no-console
const error = (err: Error): void => console.error(
  `Error (${err.name}):\n${err.message}\n\n${err.stack}`
);

export default {
  info,
  error
};
