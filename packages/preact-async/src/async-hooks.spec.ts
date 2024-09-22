import { ControllablePromise } from "@jaybeeuu/utilities/test";
import { describe, expect, it, jest } from "@jest/globals";
import { act, renderHook, waitFor } from "@testing-library/preact";
import {
  useAsyncGenerator,
  useIsMounted,
  usePromise,
  useSemanticMemo,
} from "./async-hooks";

describe("async-hooks", () => {
  describe("useIsMounted", () => {
    it("returns true while the component is mounted.", () => {
      const { result } = renderHook(() => useIsMounted());

      expect(result.current).toStrictEqual({ current: true });
    });

    it("returns false once the component is unmounted.", () => {
      const { result, unmount } = renderHook(() => useIsMounted());
      unmount();

      expect(result.current).toStrictEqual({ current: false });
    });
  });

  describe("useSemanticMemo", () => {
    it("returns the result of the memo.", () => {
      const { result } = renderHook(() => useSemanticMemo(() => 1, []));

      expect(result.current).toBe(1);
    });

    it("does not rerun the factory when the component rerenders, and the deps haven't updated.", () => {
      const factory = jest
        .fn<(memoResult: number) => number>()
        .mockImplementation((memoResult: number) => memoResult);

      const { rerender } = renderHook(
        ({ memoResult }) =>
          useSemanticMemo(() => factory(memoResult), [memoResult]),
        { initialProps: { memoResult: 1 } },
      );

      rerender({ memoResult: 1 });

      expect(factory).toHaveBeenCalledTimes(1);
    });

    it("does not rerun the factory when the component rerenders, and the deps haven't updated, even if it has returned undefined the first time.", () => {
      const factory = jest.fn<() => void>().mockReturnValue(undefined);

      const { rerender } = renderHook(
        ({ prop }) => {
          useSemanticMemo(factory, [prop]);
        },
        { initialProps: { prop: 1 } },
      );

      rerender({ prop: 1 });

      expect(factory).toHaveBeenCalledTimes(1);
    });

    it("calls the factory when the component rerenders, and the deps have updated.", () => {
      const factory = jest
        .fn<(memoResult: number) => number>()
        .mockImplementation((memoResult: number) => memoResult);

      const { rerender } = renderHook(
        ({ memoResult }) =>
          useSemanticMemo(() => factory(memoResult), [memoResult]),
        { initialProps: { memoResult: 1 } },
      );

      rerender({ memoResult: 2 });

      expect(factory).toHaveBeenCalledTimes(2);
    });

    it("doesn't call the factory when the component rerenders a third time, and the deps have not updated.", () => {
      const factory = jest
        .fn<(memoResult: number) => number>()
        .mockImplementation((memoResult: number) => memoResult);

      const { rerender } = renderHook(
        ({ memoResult }) =>
          useSemanticMemo(() => factory(memoResult), [memoResult]),
        { initialProps: { memoResult: 1 } },
      );

      rerender({ memoResult: 2 });

      rerender({ memoResult: 2 });

      expect(factory).toHaveBeenCalledTimes(2);
    });

    it("updates the return value when the component rerenders, and the deps have updated.", () => {
      const factory = jest
        .fn<(memoResult: number) => number>()
        .mockImplementation((memoResult: number) => memoResult);

      const { result, rerender } = renderHook(
        ({ memoResult }) =>
          useSemanticMemo(() => factory(memoResult), [memoResult]),
        { initialProps: { memoResult: 1 } },
      );

      rerender({ memoResult: 2 });

      expect(result.current).toBe(2);
    });
  });

  describe("useAsyncGenerator", () => {
    it("returns the initial value before the generator emits.", () => {
      const { result } = renderHook(() =>
        useAsyncGenerator(
          async function* (): AsyncGenerator<number> {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            await new Promise((resolve, reject) => {});
            yield 1;
          },
          0,
          [],
        ),
      );

      expect(result.current).toBe(0);
    });

    it("returns a new value once the generator emits.", async () => {
      const { result } = renderHook(() =>
        useAsyncGenerator(
          async function* (): AsyncGenerator<number> {
            await Promise.resolve();
            yield 1;
          },
          0,
          [],
        ),
      );

      await waitFor(() => {
        expect(result.current).toBe(1);
      });
    });

    it("doesn't explode if the component is unmounted before the generator emits.", async () => {
      const promise = new ControllablePromise();
      const { result, unmount } = renderHook(() =>
        useAsyncGenerator(
          async function* (): AsyncGenerator<number> {
            await promise;
            yield 1;
          },
          0,
          [],
        ),
      );

      unmount();

      await act(() => {
        promise.resolve();
      });

      expect(result.current).toBe(0);
    });
  });

  describe("usePromise", () => {
    it("returns pending before the promise resolves.", () => {
      const { result } = renderHook(() =>
        usePromise(() => new Promise<void>(() => {}), []),
      );

      expect(result.current.promiseState).toStrictEqual({ status: "pending" });
    });

    it("returns complete after the promise resolves.", async () => {
      const { result } = renderHook(() =>
        usePromise(() => Promise.resolve(1), []),
      );

      await waitFor(() => {
        expect(result.current.promiseState).toStrictEqual({
          status: "complete",
          value: 1,
        });
      });
    });

    it("uses the factory to calculate a nw value when the deps updae during a render.", async () => {
      const { result, rerender } = renderHook(
        ({ value }) => usePromise(() => Promise.resolve(value), [value]),
        { initialProps: { value: 1 } },
      );

      rerender({ value: 2 });

      await waitFor(() => {
        expect(result.current.promiseState).toStrictEqual({
          status: "complete",
          value: 2,
        });
      });
    });

    it("returns error after the promise rejects. Converting the reason to an error along the way.", async () => {
      const { result } = renderHook(() =>
        usePromise(
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          () => Promise.reject("Whoops!"),
          [],
        ),
      );

      await waitFor(() => {
        expect(result.current.promiseState).toStrictEqual({
          status: "failed",
          error: new Error('"Whoops!"'),
        });
      });
    });

    it("aborts the promise if the component unmounts.", async () => {
      const abortedRef: { current: boolean } = { current: false };
      const { unmount } = renderHook(() =>
        usePromise(({ abortSignal }) => {
          const promise = new ControllablePromise();
          abortSignal.onabort = () => {
            abortedRef.current = true;
            promise.reject(new Error("aborted"));
          };
          return promise;
        }, []),
      );

      unmount();

      await waitFor(() => {
        expect(abortedRef.current).toBe(true);
      });
    });

    it("aborts the promise if the component rerenders and the deps have updated.", async () => {
      const abortedRef: { current: boolean } = { current: false };
      const { rerender } = renderHook(
        ({ value }) =>
          usePromise(
            ({ abortSignal }) => {
              const promise = new ControllablePromise();
              abortSignal.onabort = () => {
                abortedRef.current = true;
                promise.reject(new Error(`aborted ${value}`));
              };
              return promise;
            },
            [value],
          ),
        { initialProps: { value: 1 } },
      );

      rerender({ value: 2 });

      await waitFor(() => {
        expect(abortedRef.current).toBe(true);
      });
    });

    it("aborts the promise when teh abort function is called.", async () => {
      const abortedRef: { current: boolean } = { current: false };
      const { result } = renderHook(
        ({ value }) =>
          usePromise(
            ({ abortSignal }) => {
              const promise = new ControllablePromise<void>();
              abortSignal.onabort = () => {
                abortedRef.current = true;
                promise.reject(new Error(`aborted ${value}`));
              };
              return promise;
            },
            [value],
          ),
        { initialProps: { value: 1 } },
      );

      await act(() => {
        result.current.abort();
      });

      await waitFor(() => {
        expect(abortedRef.current).toBe(true);
      });
    });
  });
});
