import { useRef, useState, useEffect, Inputs } from "preact/hooks";
import { PromiseStatus } from "./promise-status";

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
  generator: AsyncGenerator<PromiseStatus<Value>>,
): PromiseStatus<Value> => {
  const [status, setStatus]  = useState<PromiseStatus<Value>>({ status: "pending" });

  useAsyncEffect(async (signal) => {
    for await (const nextStatus of generator) {
      if (signal.cancelled) {
        break;
      }
      setStatus(nextStatus);
    }
  }, [generator]);

  return status;
};
