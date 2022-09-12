export type ValueOrFactory<Value> = (Value extends Function ? never : Value) | (() => Value);

const isFactory = <Value>(value: ValueOrFactory<Value>): value is () => Value => typeof value === "function";

export const delay = (msDelay: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(() => resolve(), msDelay));
};

export interface ClearablePromise<Value> extends Promise<Value> {
  clear: () => void;
}

export interface Echo {
  <Value>(value: Exclude<Value, Function>, timeout: number): ClearablePromise<Value>;
  <Value>(valueFactory: () => Value, timeout: number): ClearablePromise<Value>;
}
export const echo: Echo = <Value>(
  value: ValueOrFactory<Value>,
  msDelay: number
): ClearablePromise<Value> => {
  let timeout: number | undefined;
  const promise = Object.assign(
    new Promise<Value>((resolve) => {
      timeout = setTimeout(() => {
        const returnValue = isFactory(value) ? value() : value;
        resolve(returnValue);
      }, msDelay);
    }),
    { clear: () => clearTimeout(timeout) }
  );
  return promise;
};
