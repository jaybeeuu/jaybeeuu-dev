export const advanceByTimeThenAwait = async <Value>(
  advanceByMs: number,
  promiseFactory: () => Promise<Value>,
): Promise<Value> => {
  const resultPromise = promiseFactory();
  jest.advanceTimersByTime(advanceByMs);
  return resultPromise;
};

export const advanceToNextThenAwait = async <Value>(
  promiseFactory: () => Promise<Value>,
): Promise<Value> => {
  const resultPromise = promiseFactory();
  jest.advanceTimersToNextTimer();
  return resultPromise;
};
