import type {
  DerivedValue,
  GetDependency,
  PrimitiveValue,
  SettableValue,
  Value,
  ValueState
} from "./state/index.js";
import {
  assertIsSettableValueState,
  DerivedValueState,
  isDerivedValue,
  PrimitiveValueState
} from "./state/index.js";
import type { StoreRemovalSchedule } from "./state/store-removal-strategies.js";

export interface GetValue {
  <Val>(value: DerivedValue<Val>): DerivedValueState<Val>;
  <Val>(value: PrimitiveValue<Val>): PrimitiveValueState<Val>;
}

export type SetValue = <Val>(value: SettableValue<Val>, newValue: Val) => void;

export interface ActionContext {
  get: <Val>(value: Value<Val>) => Val;
  set: SetValue;
}

export type Action<Args extends unknown[]> = (context: ActionContext, ...args: Args) => void

export interface StoreOptions {
  defaultRemovalSchedule?: StoreRemovalSchedule;
}

type DefaultedStoreOptions = {
  [Option in keyof StoreOptions]-?: StoreOptions[Option];
}

export class Store {
  readonly #options: DefaultedStoreOptions;
  readonly #values = new Map<string, ValueState<unknown>>();

  readonly #createValue = <Val>(value: Value<Val>): ValueState<Val> => {
    if (isDerivedValue(value)) {
      return new DerivedValueState(
        value,
        () => { this.#removeValue(value); },
        (dependency) => this.#getDependency(dependency),
        this.#options.defaultRemovalSchedule
      );
    }

    return new PrimitiveValueState(
      value,
      () => { this.#removeValue(value); },
      this.#options.defaultRemovalSchedule
    );
  };

  readonly #removeValue = <Val>(value: Value<Val>): void => {
    this.#values.delete(value.name);
  };

  readonly #getDependency: GetDependency = <Val>(
    value: Value<Val>
  ): ValueState<Val> => {
    if (!(this.#values.has(value.name))) {
      this.#values.set(value.name, this.#createValue(value));
    }

    return this.#values.get(value.name) as ValueState<Val>;
  };

  constructor(options: Partial<StoreOptions> = {}) {
    this.#options = {
      defaultRemovalSchedule: { schedule: "synchronous" },
      ...options
    };
  }

  public readonly getValue: GetValue = this.#getDependency as GetValue;

  public getActor<Args extends unknown[]>(
    action: Action<Args>
  ): (...args: Args) => void {
    return (...args: Args) => {
      action(
        {
          get: <Val>(value: Value<Val>): Val => this.#getDependency(value).current,
          set: (value, entry) => {
            const valueState = this.#getDependency(value);
            assertIsSettableValueState(valueState);
            valueState.set(entry);
          }
        },
        ...args
      );
    };
  }

  public hasValue<Val>(value: Value<Val>): boolean {
    return this.#values.has(value.name);
  }
}
