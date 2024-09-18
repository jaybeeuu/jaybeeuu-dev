/**
 * @jest-environment jsdom
 */
import type {
  Action,
  ActionContext,
  PrimitiveValue,
} from "@jaybeeuu/recoilless";
import { Store } from "@jaybeeuu/recoilless";
import { assertIsNotNullish } from "@jaybeeuu/utilities";
import { describe, expect, it } from "@jest/globals";
import { renderHook } from "@testing-library/preact";
import { createTestStoreWrapper } from "../test/index.js";
import { useAction } from "./use-action.js";

const storedValue: PrimitiveValue<number> = {
  name: "storedValue",
  initialValue: 1,
};

const addDoubleToValue: Action<[number]> = (
  { get, set }: ActionContext,
  valueToDouble: number,
): void => {
  const value = get(storedValue);
  const newValue = value + 2 * valueToDouble;
  set(storedValue, newValue);
};

describe("useAction", () => {
  it("returns a function with one less arg.", () => {
    const { result } = renderHook(() => useAction(addDoubleToValue), {
      wrapper: createTestStoreWrapper(),
    });

    expect(result.current).toStrictEqual(expect.any(Function));
  });

  it("sets the store value correctly when the result is executed.", () => {
    const store = new Store();
    const { result } = renderHook(() => useAction(addDoubleToValue), {
      wrapper: createTestStoreWrapper(store),
    });
    const actor = result.current;
    assertIsNotNullish(actor);
    actor(2);

    expect(store.getValue(storedValue).current).toBe(5);
  });
});
