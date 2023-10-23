import type { Listener, Unsubscribe } from "./value-state.js";

export type RemoveFromStore = () => void;

export interface DelayedRemovalLifecyclePolicy {
  policy: "delayedRemoval";
  delay: number;
}

export interface ImmediateRemovalLifecyclePolicy {
  policy: "immediateRemoval";
}

export type RemovalPolicy = DelayedRemovalLifecyclePolicy | ImmediateRemovalLifecyclePolicy;

export class WatchableValue<Val> {
  readonly #listeners = new Set<Listener<Val>>();
  readonly #onLastUnsubscribe: () => void;

  #isUpdating: boolean = false;
  #name: string;
  #value: Val;

  public constructor(
    value: Val,
    removeFromStore: () => void,
    name: string
  ) {
    this.#name = name;
    this.#onLastUnsubscribe = removeFromStore;
    this.#value = value;
  }

  public set(newValue: Val): void {
    if (this.#isUpdating) {
      throw new Error(`Value "${this.#name}" was updated by a subscriber. A value may mot update as a result of an update to itself.`);
    }

    this.#isUpdating = true;
    this.#value = newValue;
    this.#listeners.forEach((subscription) => { subscription(this.#value); });
    this.#isUpdating = false;
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
