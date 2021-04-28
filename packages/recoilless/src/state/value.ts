import { hasFunctionProperty } from "@bickley-wallace/utilities";
import { PrimitiveValue } from "../state";
import { DerivedValue } from "./derived-value";
import { ValueState as ValueState } from "./value-state";

type ValueType<Candidate extends ValueState<unknown>> = Candidate extends ValueState<infer Val>
  ? Val
  : never

export type Value<Val> = PrimitiveValue<Val> | DerivedValue<Val>;

export type SettableValue<Val> = PrimitiveValue<Val>;

export const assertIsSettableValueState: <Candidate extends ValueState<any>>(
  candidate: Candidate
) => asserts candidate is Candidate & { setValue: (value: ValueType<Candidate>) => void } = (
  candidate
) => {
  if (!hasFunctionProperty(candidate, "setValue")) {
    throw new TypeError(`Value ${candidate.name} is not primitive.`);
  }
};
