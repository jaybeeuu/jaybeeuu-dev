import type { Value } from "./value";
import type {
  Listener,
  SettableValueState,
  Unsubscribe
} from "./value-state";
import { WatchableValue } from "./watchable-value";

export interface PrimitiveValue<Val> {
  name: string;
  initialValue: Val;
}

export class PrimitiveValueState<Val>  implements SettableValueState<Val>{
  readonly #name: string;
  readonly #value: WatchableValue<Val>;

  constructor(
    { name, initialValue }: PrimitiveValue<Val>,
    removeFromStore: () => void
  ) {
    this.#value = new WatchableValue(initialValue, removeFromStore);
    this.#name = name;
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
    return this.#value.subscribe(listener);
  }
}

export const isPrimitiveValue = <Val>(
  value: Value<Val>
): value is PrimitiveValue<Val> => {
  return "initialValue" in value;
};
