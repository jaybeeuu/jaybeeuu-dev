import type { Listener, Unsubscribe } from "./value-state.js";

export type RemoveFromStore = () => void;

export class WatchableValue<Val> {
  readonly #listeners = new Set<Listener<Val>>();
  readonly #onLastUnsubscribe: () => void;

  #value: Val;

  public constructor(
    value: Val,
    removeFromStore: () => void
  ) {
    this.#value = value;
    this.#onLastUnsubscribe = removeFromStore;
  }

  public set(newValue: Val): void {
    this.#value = newValue;
    this.#listeners.forEach((subscription) => subscription(this.#value));
  }

  public get current(): Val {
    return this.#value;
  }

  public subscribe(listener: Listener<Val>): Unsubscribe {
    this.#listeners.add(listener);

    return () => {
      this.#listeners.delete(listener);
      if (this.subscriptionCount === 0) {
        this.#onLastUnsubscribe();
      }
    };
  }

  public get subscriptionCount(): number {
    return this.#listeners.size;
  }
}
