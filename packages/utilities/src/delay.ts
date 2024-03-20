export type ValueOrFactory<Value> =
  | (Value extends AnyFunction ? never : Value)
  | (() => Value);

const isFactory = <Value>(value: ValueOrFactory<Value>): value is () => Value =>
  typeof value === "function";

export const delay = (msDelay: number): Promise<void> => {
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve();
    }, msDelay),
  );
};

export interface ClearablePromise<Value> extends Promise<Value> {
  clear: () => void;
}

export const echo = <Value>(
  value: ValueOrFactory<Value>,
  msDelay: number,
): ClearablePromise<Value> => {
  let timeout: ReturnType<typeof setTimeout>;

  const promise = Object.assign(
    new Promise<Value>((resolve) => {
      timeout = setTimeout(() => {
        resolve(isFactory(value) ? value() : value);
      }, msDelay);
    }),
    {
      clear: () => {
        clearTimeout(timeout);
      },
    },
  );
  return promise;
};

export const microEcho = <Value>(
  value: ValueOrFactory<Value>,
): Promise<Value> => {
  return new Promise<Value>((resolve) => {
    queueMicrotask(() => {
      resolve(isFactory(value) ? value() : value);
    });
  });
};
