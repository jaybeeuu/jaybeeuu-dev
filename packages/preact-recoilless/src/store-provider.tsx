
import { h, createContext, ComponentChildren, JSX } from "preact";
import { useContext, useMemo } from "preact/hooks";
import { Store } from "@bickley-wallace/recoilless";

export interface StoreProps {
  store?: Store,
  children: ComponentChildren
}

const StoreContext = createContext(new Store());

export const StoreProvider = ({ store, children }: StoreProps): JSX.Element => {
  const defaultedStore = useMemo(() => store ?? new Store(), [store]);
  return (
    <StoreContext.Provider value={defaultedStore}>
      {children}
    </StoreContext.Provider>
  );
};
StoreProvider.displayName = "StoreProvider";

export const useStore = (): Store => useContext(StoreContext);
