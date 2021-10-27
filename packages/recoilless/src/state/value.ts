import type { DerivedValue } from "./derived-value";
import type { PrimitiveValue } from "./primitive-value";

export type Value<Val> = PrimitiveValue<Val> | DerivedValue<Val>;
export type SettableValue<Val> = PrimitiveValue<Val>;
