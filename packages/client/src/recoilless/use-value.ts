import { useContext, useEffect, useMemo, useState } from "preact/hooks";
import { useAsyncGenerator } from "./async-hooks";
import { monitorPromise, PromiseStatus } from "./promise-status";
import { DerivedValueSeed, isPrimitiveValueSeed, PrimitiveValue, PrimitiveValueSeed, ValueSeed } from "./state";
import { StoreContext } from "./store-provider";

export function useValue<Value>(valueSeed: DerivedValueSeed<Promise<Value>>): PromiseStatus<Value>;
export function useValue<Value>(valueSeed: DerivedValueSeed<Value>): Value;
export function useValue<Value>(valueSeed: PrimitiveValueSeed<Value>): [Value, (newValue: Value) => void];
export function useValue<Value>(
  valueSeed: ValueSeed<Value | Promise<Value>>
): Value | PromiseStatus<Value> | [Value, (newValue: Value) => void] {
  const [, updateState] = useState({});
  const store = useContext(StoreContext);
  const value = store.getValue(valueSeed);

  useEffect(() => {
    const unsubscribe = value.subscribe(() => updateState({}));
    return () => unsubscribe();
  }, [value]);

  if (isPrimitiveValueSeed(valueSeed)) {
    const primitiveValue = value as PrimitiveValue<Value>;
    return [primitiveValue.current, primitiveValue.setValue];
  }

  const current = value.current;
  if (current instanceof Promise) {
    const promiseStatus = useMemo(() => monitorPromise(current), [current]);
    return useAsyncGenerator(promiseStatus);
  }

  return current;
}
