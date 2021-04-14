import { PrimitiveValue } from "../state";
import { DerivedValue } from "./derived-value";

export type Value<Val> = PrimitiveValue<Val> | DerivedValue<Val>;
