/**
 * @jest-environment jsdom
 */
import { ComponentType, h } from "preact";
import { Action, ActionContext, PrimitiveValue, Store } from "@bickley-wallace/recoilless";
import { assertIsNotNullish } from "@bickley-wallace/utilities";
import { renderHook } from "@testing-library/preact-hooks";
import { StoreProvider } from "./store-provider";
import { useAction } from "./use-action";

// eslint-disable-next-line react/display-name
const Wrapper = (store?: Store): ComponentType => (
  { children }
) => <StoreProvider store={store}>{children}</StoreProvider>;

const storedValue: PrimitiveValue<number> = {
  name: "storedValue",
  initialValue: 1
};

const addDoubleToValue: Action<[number]> = (
  { get, set }: ActionContext,
  valueToDouble: number
): void => {
  const value = get(storedValue);
  const newValue = value + 2 * valueToDouble;
  set(storedValue, newValue);
};

describe("useAction", () => {
  it("returns a function with one less arg.", () => {
    const { result } = renderHook(
      () => useAction(addDoubleToValue),
      { wrapper: Wrapper() }
    );

    expect(result.current).toStrictEqual(expect.any(Function));
  });

  it("sets the store value correctly when the result is executed.", () => {
    const store = new Store();
    const { result } = renderHook(
      () => useAction(addDoubleToValue),
      { wrapper: Wrapper(store) }
    );
    const actor = result.current;
    assertIsNotNullish(actor);
    actor(2);
    expect(store.getValue(storedValue).current).toBe(5);
  });
});
