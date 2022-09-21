/**
 * @jest-environment jsdom
 */
import type { DerivedValue} from "@jaybeeuu/recoilless";
import { Store } from "@jaybeeuu/recoilless";
import utils from "@jaybeeuu/utilities";
import type { ClearablePromise , ValueOrFactory } from "@jaybeeuu/utilities";
import { act, renderHook } from "@testing-library/preact-hooks";
import type { ComponentType} from "preact";
import { h } from "preact";
import { StoreProvider } from "./store-provider.js";
import { useValue } from "./use-value.js";

const { echo } = utils;

jest.mock("@jaybeeuu/utilities", () => {
  const actual = jest.requireActual<typeof utils>("@jaybeeuu/utilities");
  return {
    ...actual,
    echo: jest.fn()
  };
});

type Executor<Value> = (
  resolve: (value: Value | PromiseLike<Value>) => void,
  reject: (reason?: any) => void
) => void;

class ControllablePromise<Value> extends Promise<Value> {
  #resolvePromise?: (value: Value | PromiseLike<Value>) => void;
  #rejectPromise?: (reason?: any) => void;

  constructor(executor: Executor<Value> = () => {}) {
    let resolvePromise: (value: Value | PromiseLike<Value>) => void;
    let rejectPromise: (reason?: any) => void;
    super((resolve, reject) => {
      resolvePromise = resolve;
      rejectPromise = reject;
      executor(resolve, reject);
    });
    // @ts-expect-error
    this.#resolvePromise = resolvePromise;

    // @ts-expect-error
    this.#rejectPromise = rejectPromise;
  }

  resolve(value: Value | PromiseLike<Value>): void {
    this.#resolvePromise?.(value);
  }

  reject(reason?: any): void {
    this.#rejectPromise?.(reason);
  }
}

class DecoratedClearablePromise<Value> extends Promise<Value> {
  #clear: () => void;

  constructor(
    promise: Promise<Value> | Executor<Value>,
    clear: () => void = () => {}
  ) {
    const executor: Executor<Value> = typeof promise === "function"
      ? promise
      : (resolve) => resolve(promise);

    super(executor);
    this.#clear = clear;
  }

  clear(): void {
    this.#clear();
  }
}

interface Echo {
  resolve: () => void;
  resolveAt: number;
  id: number;
}

const isFactory = <Value,>(value: ValueOrFactory<Value>): value is () => Value => typeof value === "function";

class EchoRegistry {
  #echos: Echo[] = [];
  #currentTime = 0;
  #nextId = 0;

  set <Value,>(
    valueOrFactory: ValueOrFactory<Value>,
    delay: number = 0
  ): ClearablePromise<Value> {
    const promise = new ControllablePromise<Value>();
    const id = this.#nextId++;
    this.#echos = [
      ...this.#echos,
      {
        id,
        resolve: () => {
          const value = isFactory(valueOrFactory) ? valueOrFactory() : valueOrFactory;
          promise.resolve(value);
        },
        resolveAt: delay + this.#currentTime
      }
    ];

    return new DecoratedClearablePromise(promise, () => this.clear(id));
  }

  clear(id: number): void {
    this.#echos = this.#echos.filter((e) => e.id !== id);
  }

  advanceByTime(time: number): void {
    this.#currentTime += time;
    this.#runPendingEchos();
  }

  clearAllEchos(): void {
    this.#echos = [];
  }

  runAllEchos(): void {
    this.#currentTime = Math.max(...this.#echos.map((e) => e.resolveAt));
    this.#runPendingEchos();
  }

  advanceToNextEcho(): void {
    this.#currentTime = Math.min(...this.#echos.map((e) => e.resolveAt));
    this.#runPendingEchos();
  }

  #runPendingEchos(): void {
    this.#echos
      .filter((e) => e.resolveAt <= this.#currentTime)
      .forEach((e) => e.resolve());
    this.#echos = this.#echos
      .filter((e) => e.resolveAt > this.#currentTime);
  }
}

const setupEcho = (): EchoRegistry => {
  const echoRegistry = new EchoRegistry();

  jest.mocked(echo).mockImplementation(
    <Value,>(
      valueOrValueFactory: ValueOrFactory<Value>,
      delay: number = 0
    ): ClearablePromise<Value> => {
      return echoRegistry.set(valueOrValueFactory, delay);
    }
  );

  return echoRegistry;
};

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
      await act(() => firstStopState.set("Iceland"));
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
      setupEcho();
      const { result } = renderHook(
        () => useValue({ name: "holiday", derive: () => Promise.resolve("Whistler") }),
        { wrapper: Wrapper() }
      );

      expect(result.current).toStrictEqual({ status: "pending" });
    });

    it("returns the resolved value.", async () => {
      setupEcho();
      const { result, waitForNextUpdate } = renderHook(
        () => useValue({ name: "holiday", derive: () => Promise.resolve("Whistler") }),
        { wrapper: Wrapper() }
      );
      await waitForNextUpdate({ timeout: 100 }); // Complete
      expect(result.current).toStrictEqual({ status: "complete", value: "Whistler" });
    });

    it("returns a slow status if the promise takes a while.", async () => {
      const echoRegistry = setupEcho();
      const { result, waitForNextUpdate } = renderHook(
        () => useValue({
          name: "holiday",
          derive: () => echo("Whistler", 1000)
        }, { slowDelay: 500 }),
        { wrapper: Wrapper() }
      );

      await act(() => echoRegistry.advanceByTime(500));
      await waitForNextUpdate(); // slow
      expect(result.current).toStrictEqual({ status: "slow" });
    });

    it("resolves to the value after it was reported as slow.", async () => {
      const echoRegistry = setupEcho();
      const { result, waitForNextUpdate } = renderHook(
        () => useValue({
          name: "holiday",
          derive: () => echo("Whistler", 15)
        }, { slowDelay: 1 }),
        { wrapper: Wrapper() }
      );
      await act(() => echoRegistry.advanceByTime(5));
      await waitForNextUpdate(); // slow

      await act(() => echoRegistry.advanceByTime(10));
      await waitForNextUpdate(); // slow

      expect(result.current).toStrictEqual({ status: "complete", value: "Whistler" });
    });

    it("returns the error if the promise fails.", async () => {
      const rejectedPromise = Promise.reject(new Error("Whoops!"));
      const { result, waitForNextUpdate } = renderHook(
        () => useValue({ name: "holiday", derive: () => rejectedPromise }),
        { wrapper: Wrapper() }
      );

      await waitForNextUpdate(); // Failed
      expect(result.current).toStrictEqual({ status: "failed", error: new Error("Whoops!") });
    });
  });
});

