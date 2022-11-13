import type { ClearablePromise, ValueOrFactory } from "../delay";
import type { Executor } from "./controllable-promise";
import { ControllablePromise } from "./controllable-promise";

class DecoratedClearablePromise<Value> extends Promise<Value> {
  #clear: () => void;

  constructor(
    promise: Promise<Value> | Executor<Value>,
    clear: () => void = () => {}
  ) {
    const executor: Executor<Value> = typeof promise === "function"
      ? promise
      : (resolve) => resolve(promise);

    super(executor);
    this.#clear = clear;
  }

  clear(): void {
    this.#clear();
  }
}

interface Echo {
  resolve: () => void;
  resolveAt: number;
  id: number;
}

const isFactory = <Value,>(value: ValueOrFactory<Value>): value is () => Value => typeof value === "function";

export class EchoRegistry {
  #echos: Echo[] = [];
  #currentTime = 0;
  #nextId = 0;

  set <Value,>(
    valueOrFactory: ValueOrFactory<Value>,
    delay: number = 0
  ): ClearablePromise<Value> {
    console.log("registering echo", delay);
    const promise = new ControllablePromise<Value>();
    const id = this.#nextId++;
    this.#echos = [
      ...this.#echos,
      {
        id,
        resolve: () => {
          const value = isFactory(valueOrFactory) ? valueOrFactory() : valueOrFactory;
          promise.resolve(value);
        },
        resolveAt: delay + this.#currentTime
      }
    ];

    return new DecoratedClearablePromise(promise, () => this.clear(id));
  }

  clear(id: number): void {
    this.#echos = this.#echos.filter((e) => e.id !== id);
  }

  advanceByTime(time: number): void {
    this.#currentTime += time;
    this.#runPendingEchos();
  }

  clearAllEchos(): void {
    this.#echos = [];
  }

  runAllEchos(): void {
    this.#currentTime = Math.max(...this.#echos.map((e) => e.resolveAt));
    this.#runPendingEchos();
  }

  advanceToNextEcho(): void {
    this.#currentTime = Math.min(...this.#echos.map((e) => e.resolveAt));
    this.#runPendingEchos();
  }

  #runPendingEchos(): void {
    console.log("Running echos", this.#echos);
    this.#echos
      .filter((e) => e.resolveAt <= this.#currentTime)
      .forEach((e) => e.resolve());
    this.#echos = this.#echos
      .filter((e) => e.resolveAt > this.#currentTime);
  }
}
