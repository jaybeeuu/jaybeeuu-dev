/**
 * @jest-environment jsdom
 */
import type { DerivedValue} from "@jaybeeuu/recoilless";
import { Store } from "@jaybeeuu/recoilless";
import { monitorPromise, pending } from "@jaybeeuu/utilities";
import type { MonitorPromiseOptions } from "@jaybeeuu/utilities";
import type * as UtilitiesModule from "@jaybeeuu/utilities";
import { act, renderHook } from "@testing-library/preact";
import type { ComponentType } from "preact";
import { h } from "preact";
import { StoreProvider } from "./store-provider.js";
import { useValue } from "./use-value.js";

jest.mock<typeof UtilitiesModule>("@jaybeeuu/utilities", () => {
  const actualUtilities = jest.requireActual<typeof UtilitiesModule>("@jaybeeuu/utilities");

  return {
    ...actualUtilities,
    monitorPromise: jest.fn().mockImplementation(actualUtilities.monitorPromise)
  };
});

// eslint-disable-next-line react/display-name
const Wrapper = (store?: Store): ComponentType<{ children: Element }> => ({
  children
}) => <StoreProvider store={store}>{children}</StoreProvider>;

describe("useValue", () => {

  describe("primitive", () => {
    it("returns the initial value.", () => {
      const { result } = renderHook(
        () => useValue({ name: "holiday", initialValue: "Whistler" }),
        { wrapper: Wrapper() }
      );

      expect(result.current).toStrictEqual(["Whistler", expect.any(Function)]);
    });

    it("updates the value when the set function is called.", async () => {
      const { result } = renderHook(
        () => useValue({ name: "holiday", initialValue: "Whistler" }),
        { wrapper: Wrapper() }
      );

      await act(() => { result.current[1]("Iceland"); });

      expect(result.current).toStrictEqual(["Iceland", expect.any(Function)]);
    });

    it("updates when the value is updated somewhere else.", async () => {
      const store = new Store();
      const value = { name: "holiday", initialValue: "Whistler" };
      const { result } = renderHook(() => useValue(value), { wrapper: Wrapper(store) });
      const { result: otherResult } = renderHook(() => useValue(value), { wrapper: Wrapper(store) });

      await act(() => { otherResult.current[1]("Iceland"); });

      expect(result.current).toStrictEqual(["Iceland", expect.any(Function)]);
    });

    it("removes the value from the store when component is unmounted.", () => {
      const store = new Store();
      const value = { name: "holiday", initialValue: "Whistler" };
      const { unmount } = renderHook(() => useValue(value), { wrapper: Wrapper(store) });
      unmount();
      expect(store.hasValue(value)).toBe(false);
    });
  });

  describe("derived", () => {
    it("returns the result of the derived value function.", () => {
      const { result } = renderHook(
        () => useValue({ name: "holiday", derive: () => "Whistler" }),
        { wrapper: Wrapper() }
      );

      expect(result.current).toBe("Whistler");
    });

    it("updates the value when dependencies are updated.", async () => {
      const store = new Store();
      const firstStop = { name: "firstStop", initialValue: "Whistler" };
      const holiday: DerivedValue<string> = { name: "holiday", derive: ({ get }) => get(firstStop) };
      const firstStopState = store.getValue(firstStop);
      const { result } = renderHook(
        () => useValue(holiday), { wrapper: Wrapper(store) }
      );
      await act(() => { firstStopState.set("Iceland"); });
      expect(result.current).toBe("Iceland");
    });

    it("removes the value from the store when component is unmounted.", () => {
      const store = new Store();
      const firstStop = { name: "firstStop", initialValue: "Whistler" };
      const holiday: DerivedValue<string> = { name: "holiday", derive: ({ get }) => get(firstStop) };
      const { unmount } = renderHook(
        () => useValue(holiday), { wrapper: Wrapper(store) }
      );
      unmount();
      expect(store.hasValue(holiday)).toBe(false);
    });

    it("removes the dependencies from the store when component is unmounted.", () => {
      const store = new Store();
      const firstStop = { name: "firstStop", initialValue: "Whistler" };
      const holiday: DerivedValue<string> = { name: "holiday", derive: ({ get }) => get(firstStop) };
      const { unmount } = renderHook(
        () => useValue(holiday), { wrapper: Wrapper(store) }
      );
      unmount();
      expect(store.hasValue(firstStop)).toBe(false);
    });
  });

  describe("derived - async", () => {
    it("monitors the promise.", () => {
      const promise = Promise.resolve("Whistler");

      const options: Partial<MonitorPromiseOptions> = {};
      renderHook(
        () => useValue({ name: "holiday", derive: () => {
          return promise;
        } }, options),
        { wrapper: Wrapper() }
      );

      expect(monitorPromise).toHaveBeenCalledWith(promise, options);
    });

    it("returns the monitored status of the promise.", () => {
      const promise = Promise.resolve("Whistler");

      const options: Partial<MonitorPromiseOptions> = {};
      const { result } = renderHook(
        () => useValue({ name: "holiday", derive: () => {
          return promise;
        } }, options),
        { wrapper: Wrapper() }
      );

      expect(result.current).toStrictEqual(pending());
    });
  });
});
