import type { Store } from "@jaybeeuu/recoilless";
import type { ComponentChildren, JSX } from "preact";
import { h } from "preact";
import { StoreProvider } from "../src/store-provider.js";

export interface StoreTestWrapperProps {
  children: ComponentChildren;
}
export type StoreTestWrapper = ({
  children,
}: StoreTestWrapperProps) => JSX.Element;

export const createTestStoreWrapper = (store?: Store): StoreTestWrapper => {
  const storeTestWrapper: StoreTestWrapper = ({ children }) => (
    <StoreProvider store={store}>{children}</StoreProvider>
  );
  return storeTestWrapper;
};
