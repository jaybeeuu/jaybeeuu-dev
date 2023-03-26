import type { DerivedValue } from "./derived-value.js";
import type { PrimitiveValue } from "./primitive-value.js";

export type Value<Val> = PrimitiveValue<Val> | DerivedValue<Val>;
export type SettableValue<Val> = PrimitiveValue<Val>;

export const isPrimitiveValue = <Val>(
  value: Value<Val>
): value is PrimitiveValue<Val> => {
  return "initialValue" in value;
};

export const isDerivedValue = <Val>(
  value: Value<Val>
): value is DerivedValue<Val> => {
  return "derive" in value && typeof value.derive === "function";
};
