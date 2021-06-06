/**
 * @jest-environment jsdom
 */
import type { ComponentType} from "preact";
import { h } from "preact";
import type { DerivedValue} from "@bickley-wallace/recoilless";
import { Store } from "@bickley-wallace/recoilless";
import { act, renderHook } from "@testing-library/preact-hooks";
import { StoreProvider } from "./store-provider";
import { useValue } from "./use-value";
import { echo } from "@bickley-wallace/utilities";
import { setupMockTimers } from "../test/time";

// eslint-disable-next-line react/display-name
const Wrapper = (store?: Store): ComponentType => (
  { children }
) => <StoreProvider store={store}>{children}</StoreProvider>;

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

      await act(() => result.current?.[1]("Iceland"));

      expect(result.current).toStrictEqual(["Iceland", expect.any(Function)]);
    });

    it("updates when the value is updated somewhere else.", async () => {
      const store = new Store();
      const value = { name: "holiday", initialValue: "Whistler" };
      const { result } = renderHook(() => useValue(value), { wrapper: Wrapper(store) });
      const { result: otherResult } = renderHook(() => useValue(value), { wrapper: Wrapper(store) });

      await act(() => otherResult.current?.[1]("Iceland"));

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
      await act(() => firstStopState.setValue("Iceland"));
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
    it("immediately returns pending.", () => {
      const { result } = renderHook(
        () => useValue({ name: "holiday", derive: () => Promise.resolve("Whistler") }),
        { wrapper: Wrapper() }
      );

      expect(result.current).toStrictEqual({ status: "pending" });
    });

    it("returns the resolved value.", async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useValue({ name: "holiday", derive: () => Promise.resolve("Whistler") }),
        { wrapper: Wrapper() }
      );
      await waitForNextUpdate({ timeout: 100 }); // Complete
      expect(result.current).toStrictEqual({ status: "complete", value: "Whistler" });
    });

    it("returns a slow status if the promise takes a while.", async () => {
      setupMockTimers();
      const { result, waitForNextUpdate } = renderHook(
        () => useValue({
          name: "holiday",
          derive: () => echo("Whistler", 501)
        }),
        { wrapper: Wrapper() }
      );
      jest.advanceTimersToNextTimer();
      await waitForNextUpdate({ timeout: 100 }); // Slow
      expect(result.current).toStrictEqual({ status: "slow" });
    });

    it("resolves to the value after it was reported as slow.", async () => {
      setupMockTimers();
      const { result, waitForNextUpdate } = renderHook(
        () => useValue({
          name: "holiday",
          derive: () => echo("Whistler", 501)
        }),
        { wrapper: Wrapper() }
      );

      jest.advanceTimersToNextTimer();
      await waitForNextUpdate({ timeout: 100 }); // Slow

      jest.advanceTimersToNextTimer();
      await waitForNextUpdate({ timeout: 100 }); // COmplete

      expect(result.current).toStrictEqual({ status: "complete", value: "Whistler" });
    });

    it("returns the error if the promise fails.", async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useValue({ name: "holiday", derive: () => Promise.reject(new Error("Whoops!")) }),
        { wrapper: Wrapper() }
      );
      await waitForNextUpdate({ timeout: 100 }); // Failed
      expect(result.current).toStrictEqual({ status: "failed", error: new Error("Whoops!") });
    });
  });
});

