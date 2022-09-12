import {
  useCallback,
  useEffect,
  useMemo,
  useState
} from "preact/hooks";
import type {
  DerivedValue,
  PrimitiveValue,
  Value,
  ValueState
} from "@jaybeeuu/recoilless";
import {
  isPrimitiveValue
} from "@jaybeeuu/recoilless";
import { useAsyncGenerator } from "./async-hooks.js";
import type { MonitorPromiseOptions, PromiseState } from "./promise-status.js";
import { monitorPromise } from "./promise-status.js";
import { useStore } from "./store-provider.js";

const useValueStateSubscription = <Val>(
  valueState: ValueState<Val>
): void => {
  const [, updateState] = useState({});
  const listener = useCallback(() => { updateState({}); }, [valueState]);

  const unsubscribe = valueState.subscribe(listener);

  useEffect(() => () => { unsubscribe(); }, [listener]);
};

const usePrimitiveValue = <Val>(
  value: PrimitiveValue<Val>
): [Val, (newValue: Val) => void] => {
  const valueState = useStore().getValue(value);
  useValueStateSubscription(valueState);

  return [valueState.current, valueState.set];
};

const useDerivedValue = <Val>(
  value: DerivedValue<Val>,
  options?: Partial<MonitorPromiseOptions>
): Val | PromiseState<Val> => {
  const valueState = useStore().getValue(value);
  useValueStateSubscription(valueState);
  const current = valueState.current;

  if (current instanceof Promise) {
    const promiseStatus = useMemo(() => monitorPromise(current, options), [current]);
    return useAsyncGenerator<PromiseState<Val>>(promiseStatus, { status: "pending" });
  }

  return current;
};

export interface UseValue {
  <Val>(
    value: DerivedValue<Promise<Val>>,
    options?: Partial<MonitorPromiseOptions>
  ): PromiseState<Val>;
  <Val>(value: DerivedValue<Val>): Val;
  <Val>(value: PrimitiveValue<Val>): [Val, (newValue: Val) => void];
}
export const useValue: UseValue = <Val>(
  value: Value<Val>,
  options?: Partial<MonitorPromiseOptions>
): Val | PromiseState<Val> | [Val, (newValue: Val) => void] => {
  return isPrimitiveValue(value)
    ? usePrimitiveValue(value)
    : useDerivedValue(value, options);
};
