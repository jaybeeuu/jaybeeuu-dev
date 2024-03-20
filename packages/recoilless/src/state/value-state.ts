import { is, isObject } from "@jaybeeuu/utilities";

export type Listener<Val> = (value: Val) => void;
export type Unsubscribe = () => void;
export type RemoveFromStore = () => void;
export interface ValueState<Val> {
  current: Val;
  name: string;
  subscribe(listener: Listener<Val>): Unsubscribe;
}

export interface SettableValueState<Val> extends ValueState<Val> {
  set: (newValue: Val) => void;
}

export const assertIsSettableValueState: <Val>(
  candidate: ValueState<Val>,
) => asserts candidate is SettableValueState<Val> = (candidate) => {
  if (!isObject({ set: is("function") })(candidate)) {
    throw new TypeError(`Value ${candidate.name} is not settable.`);
  }
};
