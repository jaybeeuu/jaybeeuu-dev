import { useContext, useEffect, useMemo, useState } from "preact/hooks";
import { useAsyncGenerator } from "./async-hooks";
import { monitorPromise, PromiseState } from "./promise-status";
import { DerivedValue, isPrimitiveValue, PrimitiveValueState, PrimitiveValue, Value } from "./state";
import { StoreContext } from "./store-provider";

export function useValue<Val>(value: DerivedValue<Promise<Val>>): PromiseState<Val>;
export function useValue<Val>(value: DerivedValue<Val>): Val;
export function useValue<Val>(value: PrimitiveValue<Val>): [Val, (newValue: Val) => void];
export function useValue<Val>(
  value: Value<Val | Promise<Val>>
): Val | PromiseState<Val> | [Val, (newValue: Val) => void] {
  const [, updateState] = useState({});
  const store = useContext(StoreContext);
  const valueState = store.getValue(value);

  useEffect(() => {
    const unsubscribe = valueState.subscribe(() => updateState({}));
    return () => unsubscribe();
  }, [value]);

  if (isPrimitiveValue(value)) {
    const primitiveValue = valueState as PrimitiveValueState<Val>;
    return [primitiveValue.current, primitiveValue.setValue];
  }

  const current = valueState.current;
  if (current instanceof Promise) {
    const promiseStatus = useMemo(() => monitorPromise(current), [current]);
    return useAsyncGenerator<PromiseState<Val>>(promiseStatus, { status: "pending" });
  }

  return current;
}
