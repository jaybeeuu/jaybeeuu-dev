import { useContext, useEffect, useMemo, useRef, useState } from "preact/hooks";
import { useAsyncGenerator } from "./async-hooks";
import { monitorPromise, PromiseState } from "./promise-status";
import { DerivedValue, isPrimitiveValue, PrimitiveValue, Value, ValueState } from "./state";
import { Store } from "./store";
import { StoreContext } from "./store-provider";

const useStore = (): Store => useContext(StoreContext);

const useValueStateSubscription = <Val>(valueState: ValueState<Val>): void => {
  const [, updateState] = useState({});
  useEffect(() => {
    const unsubscribe = valueState.subscribe(() => updateState({}));

    return () => unsubscribe();
  }, [valueState]);
};

const usePrimitiveValue = <Val>(
  value: PrimitiveValue<Val>
): [Val, (newValue: Val) => void] => {
  const valueState = useStore().getValue(value);
  useValueStateSubscription(valueState);

  return [valueState.current, valueState.setValue];
};

const useDerivedValue = <Val>(
  value: DerivedValue<Val>
): Val | PromiseState<Val> => {
  const valueState = useStore().getValue(value);
  useValueStateSubscription(valueState);
  const current = valueState.current;

  if (current instanceof Promise) {
    const promiseStatus = useMemo(() => monitorPromise(current), [current]);
    return useAsyncGenerator<PromiseState<Val>>(promiseStatus, { status: "pending" });
  }

  return current;
};

export function useValue<Val>(value: DerivedValue<Promise<Val>>): PromiseState<Val>;
export function useValue<Val>(value: DerivedValue<Val>): Val;
export function useValue<Val>(value: PrimitiveValue<Val>): [Val, (newValue: Val) => void];
export function useValue<Val>(
  value: Value<Val>
): Val | PromiseState<Val> | [Val, (newValue: Val) => void] {
  return isPrimitiveValue(value)
    ? usePrimitiveValue(value)
    : useDerivedValue(value);
}
