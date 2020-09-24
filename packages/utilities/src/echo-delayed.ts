export const echoDelayed = <Value>(value: Value, delay: number): Promise<Value> => {
  return new Promise((resolve) => setTimeout(() => resolve(value), delay));
};
