export const delay = (msDelay: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(() => resolve(), msDelay));
};

export interface Echo {
  <Value>(value: Exclude<Value, Function>, timeout: number): Promise<Value>;
  <Value>(valueFactory: () => Value, timeout: number): Promise<Value>;
}
export const echo: Echo = async <Value>(
  value: ValueOrFactory<Value>,
  msDelay: number
): Promise<Value> => {
  await delay(msDelay);
  return typeof value === "function" ? value() : value;
};

export type ClearablePromise<Value> = { clear: () => void, promise: Promise<Value> }

export interface ClearableEcho {
  <Value>(value: Exclude<Value, Function>, timeout: number): ClearablePromise<Value>;
  <Value>(valueFactory: () => Value, timeout: number): ClearablePromise<Value>;
}
export const clearableEcho: ClearableEcho = <Value>(
  value: ValueOrFactory<Value>,
  msDelay: number
): ClearablePromise<Value> => {
  let timeout: number | undefined;
  return {
    clear: () => clearTimeout(timeout),
    promise: new Promise<Value>((resolve) => {
      timeout = setTimeout(() => {
        const returnValue = typeof value === 'function' ? value() : value;

        resolve(returnValue);
      }, msDelay);
    })
  };
};
