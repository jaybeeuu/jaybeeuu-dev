const debounce = (actor, delay) => {
  let nextStrategy;

  let executeOnTimeout = false;

  const runImmediate = () => {
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

  const scheduleExecution = () => {
    executeOnTimeout = true;
  };

  nextStrategy = runImmediate;

  return () => nextStrategy();
};

export default debounce;