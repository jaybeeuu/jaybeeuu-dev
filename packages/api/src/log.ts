// eslint-disable-next-line no-console
const info = (...args: any[]): void => console.log(...args);
const error = (error: Error): void => console.log(`Error:\n${error.message}\n\n${error.stack}`);

export default {
  info,
  error
};
