import type {
  DerivedValue,
  GetDependency,
  PrimitiveValue,
  RemoveFromStore,
  SettableValue,
  Value,
  ValueState
} from "./state/index";
import {
  assertIsSettableValueState,
  DerivedValueState,
  isDerivedValue,
  PrimitiveValueState
} from "./state/index";

const createValue = <Val>(
  value: Value<Val>,
  removeFromStore: RemoveFromStore,
  getDependency: GetDependency
): ValueState<Val> => {
  if (isDerivedValue(value)) {
    return new DerivedValueState(value, removeFromStore, getDependency);
  }

  return new PrimitiveValueState(value, removeFromStore);
};

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

export class Store {
  readonly #values: { [name:string]: ValueState<unknown> } = {};

  readonly #removeValue = <Val>(value: Value<Val>): void => {
    delete this.#values[value.name];
  };

  readonly #getDependency: GetDependency = <Val>(
    value: Value<Val>
  ): ValueState<Val> => {
    if (!(value.name in this.#values)) {
      this.#values[value.name] = createValue(
        value,
        () => this.#removeValue(value),
        this.#getDependency
      );
    }

    return this.#values[value.name] as ValueState<Val>;
  };

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
    return value.name in this.#values;
  }
}
