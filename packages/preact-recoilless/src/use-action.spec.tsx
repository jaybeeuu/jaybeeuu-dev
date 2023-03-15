/**
 * @jest-environment jsdom
 */
import type { Action, ActionContext, PrimitiveValue} from "@jaybeeuu/recoilless";
import { Store } from "@jaybeeuu/recoilless";
import { assertIsNotNullish } from "@jaybeeuu/utilities";
import { renderHook } from "@testing-library/preact";
import type { ComponentChildren, JSX } from "preact";
import { h } from "preact";
import { StoreProvider } from "./store-provider.js";
import { useAction } from "./use-action.js";

// eslint-disable-next-line react/display-name
const Wrapper = (store?: Store): (props: { children: ComponentChildren }) => JSX.Element => (
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
