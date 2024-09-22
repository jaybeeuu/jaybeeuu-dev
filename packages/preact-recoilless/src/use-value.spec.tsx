/**
 * @jest-environment jsdom
 */
import type { DerivedValue } from "@jaybeeuu/recoilless";
import { Store } from "@jaybeeuu/recoilless";
import type * as UtilitiesModule from "@jaybeeuu/utilities";
import type { MonitorPromiseOptions } from "@jaybeeuu/utilities";
import { monitorPromise, pending } from "@jaybeeuu/utilities";
import { describe, expect, it, jest } from "@jest/globals";
import { act, renderHook } from "@testing-library/preact";
import { createTestStoreWrapper } from "../test/index.js";
import { useValue } from "./use-value.js";

jest.mock("@jaybeeuu/utilities", (): typeof UtilitiesModule => {
  const actualUtilities = jest.requireActual<typeof UtilitiesModule>(
    "@jaybeeuu/utilities",
  );

  return {
    ...actualUtilities,
    monitorPromise: jest
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .fn<typeof actualUtilities.monitorPromise<any>>()
      .mockImplementation(actualUtilities.monitorPromise),
  };
});

describe("useValue", () => {
  describe("primitive", () => {
    it("returns the initial value.", () => {
      const { result } = renderHook(
        () => useValue({ name: "holiday", initialValue: "Whistler" }),
        { wrapper: createTestStoreWrapper() },
      );

      expect(result.current).toStrictEqual(["Whistler", expect.any(Function)]);
    });

    it("updates the value when the set function is called.", async () => {
      const { result } = renderHook(
        () => useValue({ name: "holiday", initialValue: "Whistler" }),
        { wrapper: createTestStoreWrapper() },
      );

      await act(() => {
        result.current[1]("Iceland");
      });

      expect(result.current).toStrictEqual(["Iceland", expect.any(Function)]);
    });

    it("updates when the value is updated somewhere else.", async () => {
      const store = new Store();
      const value = { name: "holiday", initialValue: "Whistler" };
      const { result } = renderHook(() => useValue(value), {
        wrapper: createTestStoreWrapper(store),
      });
      const { result: otherResult } = renderHook(() => useValue(value), {
        wrapper: createTestStoreWrapper(store),
      });

      await act(() => {
        otherResult.current[1]("Iceland");
      });

      expect(result.current).toStrictEqual(["Iceland", expect.any(Function)]);
    });

    it("removes the value from the store when component is unmounted.", () => {
      const store = new Store();
      const value = { name: "holiday", initialValue: "Whistler" };
      const { unmount } = renderHook(() => useValue(value), {
        wrapper: createTestStoreWrapper(store),
      });
      unmount();

      expect(store.hasValue(value)).toBe(false);
    });
  });

  describe("derived", () => {
    it("returns the result of the derived value function.", () => {
      const { result } = renderHook(
        () => useValue({ name: "holiday", derive: () => "Whistler" }),
        { wrapper: createTestStoreWrapper() },
      );

      expect(result.current).toBe("Whistler");
    });

    it("updates the value when dependencies are updated.", async () => {
      const store = new Store();
      const firstStop = { name: "firstStop", initialValue: "Whistler" };
      const holiday: DerivedValue<string> = {
        name: "holiday",
        derive: ({ get }) => get(firstStop),
      };
      const firstStopState = store.getValue(firstStop);
      const { result } = renderHook(() => useValue(holiday), {
        wrapper: createTestStoreWrapper(store),
      });
      await act(() => {
        firstStopState.set("Iceland");
      });

      expect(result.current).toBe("Iceland");
    });

    it("removes the value from the store when component is unmounted.", () => {
      const store = new Store();
      const firstStop = { name: "firstStop", initialValue: "Whistler" };
      const holiday: DerivedValue<string> = {
        name: "holiday",
        derive: ({ get }) => get(firstStop),
      };
      const { unmount } = renderHook(() => useValue(holiday), {
        wrapper: createTestStoreWrapper(store),
      });
      unmount();

      expect(store.hasValue(holiday)).toBe(false);
    });

    it("removes the dependencies from the store when component is unmounted.", () => {
      const store = new Store();
      const firstStop = { name: "firstStop", initialValue: "Whistler" };
      const holiday: DerivedValue<string> = {
        name: "holiday",
        derive: ({ get }) => get(firstStop),
      };
      const { unmount } = renderHook(() => useValue(holiday), {
        wrapper: createTestStoreWrapper(store),
      });
      unmount();

      expect(store.hasValue(firstStop)).toBe(false);
    });
  });

  describe("derived - async", () => {
    it("monitors the promise.", () => {
      const promise = Promise.resolve("Whistler");

      const options: Partial<MonitorPromiseOptions> = {};
      renderHook(
        () =>
          useValue(
            {
              name: "holiday",
              derive: () => {
                return promise;
              },
            },
            options,
          ),
        { wrapper: createTestStoreWrapper() },
      );

      expect(monitorPromise).toHaveBeenCalledWith(promise, options);
    });

    it("returns the monitored status of the promise.", () => {
      const promise = Promise.resolve("Whistler");

      const options: Partial<MonitorPromiseOptions> = {};
      const { result } = renderHook(
        () =>
          useValue(
            {
              name: "holiday",
              derive: () => {
                return promise;
              },
            },
            options,
          ),
        { wrapper: createTestStoreWrapper() },
      );

      expect(result.current).toStrictEqual(pending());
    });
  });
});
