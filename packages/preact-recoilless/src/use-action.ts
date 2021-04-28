import { Action } from "@bickley-wallace/recoilless";
import { useMemo } from "preact/hooks";
import { useStore } from "./store-provider";

export const useAction = <Args extends unknown[]>(
  action: Action<Args>
): (...args: Args) => void => {
  const store = useStore();
  return useMemo(
    () => store.getActor(action),
    [store]
  );
};
