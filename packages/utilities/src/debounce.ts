import { assertIsNotNullish } from "./type-guards/index.js";

export interface DebounceOptions {
  delay: number;
  leading: boolean;
}

export type UserDebounceOptions = Partial<DebounceOptions> & Pick<DebounceOptions, "delay">;

const normalisedOptions = (optionsOrDelay: number | UserDebounceOptions): DebounceOptions => {
  const userOptions = typeof optionsOrDelay === "number"
    ? { delay: optionsOrDelay }
    : optionsOrDelay;

  return {
    leading: false,
    ...userOptions
  };
};

export const debounce = <Args extends unknown[]>(
  actor: (...args: Args) => void,
  optionsOrDelay: number | UserDebounceOptions
): (...args: Args) => void => {
  const options = normalisedOptions(optionsOrDelay);
  let latestArgs: Args | null = null;
  let shouldExecute = false;
  let nextStrategy: (...args: Args) => void;

  const immediateExecution = (...args: Args): void => {
    actor(...args);
    scheduleExecution(...args);
    shouldExecute = false;
  };

  const setLatestArgs = (...args: Args): void => {
    shouldExecute = true;
    latestArgs = args;
  };

  const scheduleExecution = (...args: Args): void => {
    latestArgs = args;
    nextStrategy = setLatestArgs;
    shouldExecute = true;
    setTimeout(() => {
      if (shouldExecute) {
        nextStrategy = scheduleExecution;
        assertIsNotNullish(latestArgs);
        actor(...latestArgs);
      } else {
        nextStrategy = options.leading
          ? immediateExecution
          : scheduleExecution;
      }
    }, options.delay);
  };
  nextStrategy = options.leading
    ? immediateExecution
    : scheduleExecution;
  return (...args) => { nextStrategy(...args); };
};
