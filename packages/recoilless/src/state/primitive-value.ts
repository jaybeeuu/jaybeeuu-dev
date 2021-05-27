import type { Value } from "./value";
import { ValueState } from "./value-state";

export interface PrimitiveValue<Val> {
  name: string;
  initialValue: Val;
}

export class PrimitiveValueState<Val> extends ValueState<Val> {
  constructor(
    { name, initialValue }: PrimitiveValue<Val>,
    removeFromStore: () => void
  ) {
    super(name, initialValue, removeFromStore);
  }

  public setValue: (newValue: Val) => void = (newValue) => {
    super.setValue(newValue);
  }
}

export const isPrimitiveValue = <Val>(
  value: Value<Val>
): value is PrimitiveValue<Val> => {
  return "initialValue" in value;
};
