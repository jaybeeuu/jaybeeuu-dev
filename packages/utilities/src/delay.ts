export const delay = (timeout: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(() => resolve(), timeout));
};

export const echoDelayed = async <Value>(value: Value, timeout: number): Promise<Value> => {
  await delay(timeout);
  return value;
};
