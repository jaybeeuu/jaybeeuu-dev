import { asError, echo } from "@jaybeeuu/utilities";
import { advanceByTimeThenAwait } from "../test/async-helpers.js";
import { useFakeTimers } from "../test/time.js";
import type { MonitorPromiseOptions, PromiseState} from "./promise-status.js";
import { monitorPromise, combinePromises } from "./promise-status.js";

const getPromiseStatusIterator = <Value>(
  promise: Promise<Value>,
  options: Partial<MonitorPromiseOptions> = {}
): AsyncIterator<PromiseState<Value>> => {
  const request = monitorPromise(promise, options);
  return request[Symbol.asyncIterator]();
};

const getNextValue = async <Value>(asyncIterator: AsyncIterator<Value>): Promise<Value> => {
  const result = await asyncIterator.next();
  if (!result.done) {
    return result.value;
  }
  throw new Error("Iterator is done.");
};

describe("monitorPromise", () => {
  it("returns a pending request then the response.", async () => {
    const requestIterator = getPromiseStatusIterator(Promise.resolve("Apples"));

    const firstResult = await getNextValue(requestIterator);
    expect(firstResult).toStrictEqual({
      status: "complete",
      value: "Apples"
    });
  });

  it("once the response is returned the iterator terminates.", async () => {
    const requestIterator = getPromiseStatusIterator(Promise.resolve("Apples"));

    await getNextValue(requestIterator);
    await expect(
      getNextValue(requestIterator)
    ).rejects.toStrictEqual(new Error("Iterator is done."));
  });

  describe("slow", () => {
    useFakeTimers();

    it("returns a slow request status if the request takes longer than 500ms.", async () => {
      const requestIterator = getPromiseStatusIterator(echo("Pears", 501), { slowDelay: 500 });

      const firstResult = await advanceByTimeThenAwait(500, () => getNextValue(requestIterator));

      expect(firstResult).toStrictEqual({
        status: "slow"
      });

      const secondResult = await advanceByTimeThenAwait(1, () => getNextValue(requestIterator));

      expect(secondResult).toStrictEqual({
        status: "complete",
        value: "Pears"
      });
    });
  });

  it("returns an error if the request fails.", async () => {
    const errorResponse = { message: "Whoops!" };

    const requestIterator = getPromiseStatusIterator(Promise.reject(errorResponse));

    const result = await getNextValue(requestIterator);
    expect(result).toStrictEqual({
      status: "failed",
      error: asError(errorResponse)
    });
  });

  describe("timeout", () => {
    useFakeTimers();

    it("returns an if the request takes longer than the timeout.", async () => {
      const requestIterator = getPromiseStatusIterator(
        echo("Pears", 501),
        { timeoutDelay: 50 }
      );
      const nextPromise = getNextValue(requestIterator);

      jest.advanceTimersByTime(100);

      const result = await nextPromise;
      expect(result).toStrictEqual({
        status: "failed",
        error: new Error("Request timed out.")
      });
    });
  });
});

describe("combinePromises", () => {
  const samples: {
    description: string,
    values: { [key: string]: PromiseState | unknown },
    expected: PromiseState
  }[] = [
    {
      description: "forwards simple values",
      values: { string: "string", number: 1, object: { id: "{object}" } },
      expected: {
        status: "complete",
        value: { string: "string", number: 1, object: { id: "{object}" } }
      }
    },
    {
      description: "returns a complete promise if all the promises are complete.",
      values: { first: { status: "complete", value: 1 }, second: { status: "complete", value: 2 } },
      expected: {
        status: "complete",
        value: { first: 1, second: 2 }
      }
    },
    {
      description: "returns a pending promise if one of the promises is pending.",
      values: { first: { status: "pending" }, second: { status: "complete", value: 2 } },
      expected: { status: "pending" }
    },
    {
      description: "returns a slow promise if one of the promises is slow.",
      values: { first: { status: "slow" }, second: { status: "pending" } },
      expected: { status: "slow" }
    },
    {
      description: "returns a failed if one of the promises has failed.",
      values: { first: { status: "failed", error: new Error("Whoops!") }, second: { status: "pending" } },
      expected: { status: "failed", error: { first: new Error("Whoops!") } }
    },
    {
      description: "returns a failed if one of the promises has failed.",
      values: {
        first: { status: "failed", error: new Error("Whoops") },
        second: { status: "failed", error: new Error("Uh oh...") }
      },
      expected: { status: "failed", error: { first: new Error("Whoops"), second: new Error("Uh oh...") } }
    },
    {
      description: "flattens errors in child promises.",
      values: {
        first: { status: "failed", error: new Error("Whoops") },
        second: { status: "failed", error: { a: new Error("Uh oh..."), b: new Error("Really?") } }
      },
      expected: {
        status: "failed",
        error: {
          first: new Error("Whoops"),
          "second.a": new Error("Uh oh..."),
          "second.b": new Error("Really?")
        }
      }
    }
  ];
  it.each(samples)(
    "$description",
    ({ values, expected }) => {
      const combined = combinePromises(values);
      expect(combined).toStrictEqual(expected);
    }
  );
});
