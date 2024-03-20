import type {
  StoreRemovalSchedule,
  UnscheduleRemoval,
} from "./store-removal-strategies.js";
import { makeScheduler } from "./store-removal-strategies.js";
import type {
  Listener,
  SettableValueState,
  Unsubscribe,
} from "./value-state.js";
import { WatchableValue } from "./watchable-value.js";

export interface PrimitiveValue<Val> {
  name: string;
  initialValue: Val;
  removalSchedule?: StoreRemovalSchedule;
}

export class PrimitiveValueState<Val> implements SettableValueState<Val> {
  readonly #name: string;
  readonly #value: WatchableValue<Val>;
  readonly #unscheduleRemoval: UnscheduleRemoval = () => {};

  constructor(
    { name, initialValue, removalSchedule }: PrimitiveValue<Val>,
    removeFromStore: () => void,
    defaultRemovalSchedule: StoreRemovalSchedule,
  ) {
    this.#name = name;
    const { schedule: scheduleRemoval, unschedule: unscheduleRemoval } =
      makeScheduler(removalSchedule ?? defaultRemovalSchedule, () => {
        removeFromStore();
      });

    this.#value = new WatchableValue(
      initialValue,
      () => {
        scheduleRemoval();
      },
      name,
    );
    this.#unscheduleRemoval = unscheduleRemoval;
  }

  public get current(): Val {
    return this.#value.current;
  }

  public get name(): string {
    return this.#name;
  }

  public readonly set = (newValue: Val): void => {
    this.#value.set(newValue);
  };

  public subscribe(listener: Listener<Val>): Unsubscribe {
    this.#unscheduleRemoval();
    return this.#value.subscribe(listener);
  }
}
