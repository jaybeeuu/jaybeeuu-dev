import type { DerivedValue } from "./derived-value.js";
import type { PrimitiveValue } from "./primitive-value.js";

export type Value<Val> = PrimitiveValue<Val> | DerivedValue<Val>;
export type SettableValue<Val> = PrimitiveValue<Val>;
