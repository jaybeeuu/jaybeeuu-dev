export const delay = (timeout: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(() => resolve(), timeout));
};

export const echo = async <Value>(value: Value, timeout: number): Promise<Value> => {
  await delay(timeout);
  return value;
};

export const clearableEcho = <Value>(
  value: Value,
  ms: number
): { clear: () => void, promise: Promise<Value> } => {
  let timeout: number | undefined;
  return {
    clear: () => clearTimeout(timeout),
    promise: new Promise((resolve) => {
      timeout = setTimeout(() => { resolve(value); }, ms);
    })
  };
};
