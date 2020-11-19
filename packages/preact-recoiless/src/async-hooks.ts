import { useRef, useState, useEffect, Inputs } from "preact/hooks";

const useAsyncEffect = (
  effect: ({ cancelled }: { cancelled: boolean }) => Promise<void>,
  dependencies: Inputs
): void => {
  const signal = useRef({ cancelled: false });
  useEffect(() => {
    signal.current.cancelled = false;
    void effect(signal.current);

    return () => {
      signal.current.cancelled = true;
    };
  }, dependencies);
};

export const useAsyncGenerator = <Value>(
  generator: AsyncGenerator<Value>,
  initialValue: Value
): Value => {
  const [value, setValue] = useState<Value>(initialValue);

  useAsyncEffect(async (signal) => {
    for await (const nextValue of generator) {
      if (signal.cancelled) {
        break;
      }
      setValue(nextValue);
    }
  }, [generator]);

  return value;
};
