export type Executor<Value> = (
  resolve: (value: Value | PromiseLike<Value>) => void,
  reject: (reason?: unknown) => void
) => void;

export class ControllablePromise<Value = void> extends Promise<Value> {
  #resolvePromise?: (value: Value | PromiseLike<Value>) => void;
  #rejectPromise?: (reason?: unknown) => void;

  constructor(executor: Executor<Value> = () => {}) {
    let resolvePromise: (value: Value | PromiseLike<Value>) => void;
    let rejectPromise: (reason?: unknown) => void;
    super((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
      executor(resolve, reject);
    });

    // @ts-expect-error The executor passed into super is called before control returns to this constructor.
    // Therefore resolvePromise will always be defined by the time we set #resolvePromise.
    this.#resolvePromise = resolvePromise;

    // @ts-expect-error See explanation above.
    this.#rejectPromise = rejectPromise;
  }

  resolve(value: Value | PromiseLike<Value>): void {
    this.#resolvePromise?.(value);
  }

  reject(reason?: unknown): void {
    this.#rejectPromise?.(reason);
  }
}
