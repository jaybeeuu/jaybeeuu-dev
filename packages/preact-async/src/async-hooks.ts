import type { MonitorPromiseOptions, PromiseState } from "@jaybeeuu/utilities";
import { monitorPromise, pending } from "@jaybeeuu/utilities";
import type { Inputs, MutableRef } from "preact/hooks";
import { useCallback, useEffect, useRef, useState } from "preact/hooks";

export const useIsMounted = (): MutableRef<boolean> => {
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => (isMountedRef.current = false);
  });

  return isMountedRef;
};

const noValueSymbol = Symbol.for("no-value");

export const useSemanticMemo = <Value>(
  getValue: () => Value,
  inputs: Inputs,
): Value => {
  const previousInputs = useRef(inputs);
  const previousValue = useRef<Value | typeof noValueSymbol>(noValueSymbol);

  if (
    previousValue.current === noValueSymbol ||
    inputs.some((input, index) => input !== previousInputs.current[index])
  ) {
    previousValue.current = getValue();
    previousInputs.current = inputs;
  }

  return previousValue.current;
};

export const useAsyncGenerator = <Value>(
  makeGenerator: () => AsyncGenerator<Value>,
  initialValue: Value,
  deps: Inputs,
): Value => {
  const [value, setValue] = useState<Value>(initialValue);
  const isMounted = useIsMounted();
  const generator = useSemanticMemo(makeGenerator, deps);

  useEffect(() => {
    void (async () => {
      for await (const nextValue of generator) {
        if (!isMounted.current) {
          return;
        }
        setValue(nextValue);
      }
    })();
  }, [generator]);

  return value;
};

export const usePromise = <Value>(
  getPromise: (options: { abortSignal: AbortSignal }) => Promise<Value>,
  inputs: Inputs,
  options?: Partial<MonitorPromiseOptions>,
): {
  abort: () => void;
  promiseState: PromiseState<Value>;
} => {
  const isMounted = useIsMounted();
  const abortRef = useRef(() => {});
  const [promiseState, setPromiseState] =
    useState<PromiseState<Value>>(pending());

  useEffect(() => {
    const abortController = new AbortController();
    abortRef.current = () => {
      abortController.abort();
    };

    const statusGenerator = monitorPromise(
      getPromise({ abortSignal: abortController.signal }),
      options,
    );

    void (async () => {
      for await (const nextValue of statusGenerator) {
        if (!isMounted.current) {
          return;
        }
        setPromiseState(nextValue);
      }
    })();

    return () => {
      abortController.abort();
    };
  }, inputs);

  return {
    abort: useCallback(() => {
      abortRef.current();
    }, []),
    promiseState,
  };
};
