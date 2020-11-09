import { ComponentType, h } from "preact";
import { act, renderHook } from "@testing-library/preact-hooks";
import { Store } from "./store";
import { StoreProvider } from "./store-provider";
import { useValue } from "./use-value";
import { DerivedValue } from "./state";
import { echo } from "@bickley-wallace/utilities";

jest.useFakeTimers();
beforeEach(() => {
  jest.clearAllTimers();
});

const wrapper = (store?: Store): ComponentType => (
  { children }
) => <StoreProvider store={store}>{children}</StoreProvider>;

describe("useValue", () => {
  describe("primitive", () => {
    it("returns the initial value.", () => {
      const { result } = renderHook(
        () => useValue({ name: "holiday", initialValue: "Whistler" }),
        { wrapper: wrapper() }
      );

      expect(result.current).toStrictEqual(["Whistler", expect.any(Function)]);
    });

    it("updates the value when the set function is called.", async () => {
      const { result } = renderHook(
        () => useValue({ name: "holiday", initialValue: "Whistler" }),
        { wrapper: wrapper() }
      );

      await act(() => result.current?.[1]("Iceland"));

      expect(result.current).toStrictEqual(["Iceland", expect.any(Function)]);
    });

    it("updates when the value is updated somewhere else.", async () => {
      const store = new Store();
      const value = { name: "holiday", initialValue: "Whistler" };
      const { result } = renderHook(() => useValue(value), { wrapper: wrapper(store) });
      const { result: otherResult } = renderHook(() => useValue(value), { wrapper: wrapper(store) });

      await act(() => otherResult.current?.[1]("Iceland"));

      expect(result.current).toStrictEqual(["Iceland", expect.any(Function)]);
    });

    it("removes the value from the store when component is unmounted.", async () => {
      const store = new Store();
      const value = { name: "holiday", initialValue: "Whistler" };
      const { unmount } = renderHook(() => useValue(value), { wrapper: wrapper(store) });
      unmount();
      expect(store.hasValue(value)).toBe(false);
    });
  });

  describe("derived", () => {
    it("returns the result of the derived value function.", () => {
      const { result } = renderHook(
        () => useValue({ name: "holiday", derive: () => "Whistler" }),
        { wrapper: wrapper() }
      );

      expect(result.current).toBe("Whistler");
    });

    it("updates the value when dependencies are updated.", async () => {
      const store = new Store();
      const firstStop = { name: "firstStop", initialValue: "Whistler" };
      const holiday: DerivedValue<string> = { name: "holiday", derive: ({ get }) => get(firstStop) }
      const firstStopState = store.getValue(firstStop);
      const { result } = renderHook(
        () => useValue(holiday), { wrapper: wrapper(store) }
      );
      await act(() => firstStopState.setValue("Iceland"));
      expect(result.current).toBe("Iceland");
    });

    it("removes the value from the store when component is unmounted.", async () => {
      const store = new Store();
      const firstStop = { name: "firstStop", initialValue: "Whistler" };
      const holiday: DerivedValue<string> = { name: "holiday", derive: ({ get }) => get(firstStop) }
      const { unmount } = renderHook(
        () => useValue(holiday), { wrapper: wrapper(store) }
      );
      unmount();
      expect(store.hasValue(holiday)).toBe(false);
    });

    it("removes the dependencies from the store when component is unmounted.", async () => {
      const store = new Store();
      const firstStop = { name: "firstStop", initialValue: "Whistler" };
      const holiday: DerivedValue<string> = { name: "holiday", derive: ({ get }) => get(firstStop) }
      const { unmount } = renderHook(
        () => useValue(holiday), { wrapper: wrapper(store) }
      );
      unmount();
      expect(store.hasValue(firstStop)).toBe(false);
    });
  });

  describe("derived - async", () => {
    it("immediately returns pending.", () => {
      const { result } = renderHook(
        () => useValue({ name: "holiday", derive: () => Promise.resolve("Whistler") }),
        { wrapper: wrapper() }
      );

      expect(result.current).toStrictEqual({ status: "pending" });
    });

    it("returns the resolved value.", async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useValue({ name: "holiday", derive: () => Promise.resolve("Whistler") }),
        { wrapper: wrapper() }
      );
      await waitForNextUpdate({ timeout: 100 }); // Complete
      expect(result.current).toStrictEqual({ status: "complete", value: "Whistler" });
    });

    it("returns a slow status if the promise takes a while.", async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useValue({
          name: "holiday",
          derive: () => echo("Whistler", 501)
        }),
        { wrapper: wrapper() }
      );
      jest.advanceTimersToNextTimer();
      await waitForNextUpdate({ timeout: 100 }); // Slow
      expect(result.current).toStrictEqual({ status: "slow" });
    });

    it("resolves to the value after it was reported as slow.", async () => {
      const { result, waitForNextUpdate } = renderHook(
        () => useValue({
          name: "holiday",
          derive: () => echo("Whistler", 501)
        }),
        { wrapper: wrapper() }
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
        { wrapper: wrapper() }
      );
      await waitForNextUpdate({ timeout: 100 }); // Failed
      expect(result.current).toStrictEqual({ status: "failed", error: new Error("Whoops!") });
    });
  });
});

