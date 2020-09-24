
import { h, createContext, ComponentChildren, JSX } from "preact";
import { useMemo } from "preact/hooks";
import { Store } from "./store";

export interface StoreProps {
  children: ComponentChildren
}

export const StoreContext = createContext(new Store());

export const StoreProvider = ({ children }: StoreProps): JSX.Element => {
  const store = useMemo(() => new Store(), []);
  return (
    <StoreContext.Provider value={store}>
      {children}
    </StoreContext.Provider>
  );
};
StoreProvider.displayName = "StoreProvider";
