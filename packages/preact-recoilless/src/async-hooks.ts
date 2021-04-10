import { useState, useEffect } from "preact/hooks";

export const useAsyncGenerator = <Value>(
  generator: AsyncGenerator<Value>,
  initialValue: Value
): Value => {
  const [value, setValue] = useState<Value>(initialValue);

  useEffect(() => {
    void (async () => {
      for await (const nextValue of generator) {
        setValue(nextValue);
      }
    })();
  }, [generator]);

  return value;
};
