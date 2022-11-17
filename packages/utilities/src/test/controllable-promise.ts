export type Executor<Value> = (
  resolve: (value: Value | PromiseLike<Value>) => void,
  reject: (reason?: any) => void
) => void;

export class ControllablePromise<Value = undefined> extends Promise<Value> {
  #resolvePromise?: (value: Value | PromiseLike<Value>) => void;
  #rejectPromise?: (reason?: any) => void;

  constructor(executor: Executor<Value> = () => {}) {
    let resolvePromise: (value: Value | PromiseLike<Value>) => void;
    let rejectPromise: (reason?: any) => void;
    super((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
      executor(resolve, reject);
    });

    // @ts-expect-error
    this.#resolvePromise = resolvePromise;

    // @ts-expect-error
    this.#rejectPromise = rejectPromise;
  }

  resolve(value: Value | PromiseLike<Value>): void {
    this.#resolvePromise?.(value);
  }

  reject(reason?: any): void {
    this.#rejectPromise?.(reason);
  }
}
