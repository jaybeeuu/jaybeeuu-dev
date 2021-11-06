export const delay = (msDelay: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(() => resolve(), msDelay));
};

const isFactory = <Value>(value: ValueOrFactory<Value>): value is () => Value => typeof value === "function";

export type ClearablePromise<Value> = Promise<Value> & { clear: () => void };

export interface ClearableEcho {
  <Value>(value: Exclude<Value, Function>, timeout: number): ClearablePromise<Value>;
  <Value>(valueFactory: () => Value, timeout: number): ClearablePromise<Value>;
}
export const echo: ClearableEcho = <Value>(
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
