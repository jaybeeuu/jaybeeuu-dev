const debounce = <Args extends any[]>(
  actor: (...args: Args) => void,
  delay: number
): (...args: Args) => void => {
  let latestArgs: Args | null = null;

  const setLatestArgs = (...args: Args): void => {
    latestArgs = args;
  };

  let nextStrategy = setLatestArgs;

  const scheduleExecution = (...args: Args): void => {
    latestArgs = args;
    nextStrategy = setLatestArgs;
    setTimeout(() => {
      nextStrategy = scheduleExecution;
      actor(...latestArgs!);
    }, delay);
  };
  nextStrategy = scheduleExecution;
  return (...args) => nextStrategy(...args);
};

export default debounce;