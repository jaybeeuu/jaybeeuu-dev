const debounce = (actor: () => void, delay: number): () => void => {
  let nextStrategy: () => void = () => {};

  let executeOnTimeout = false;

  const runImmediate = (): void => {
    actor();
    executeOnTimeout = false;
    nextStrategy = scheduleExecution;

    setTimeout(() => {
      if(executeOnTimeout) {
        runImmediate();
      } else {
        nextStrategy = runImmediate;
      }
    }, delay);
  };

  const scheduleExecution = (): void => {
    executeOnTimeout = true;
  };

  nextStrategy = runImmediate;

  return () => nextStrategy();
};

export default debounce;