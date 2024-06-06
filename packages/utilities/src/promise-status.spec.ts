import { echo } from "./delay.js";
import {
  advanceByTimeThenAwait,
  advanceToNextThenAwait,
  withFakeTimers,
} from "./test/index.js";
import type { MonitorPromiseOptions, PromiseState } from "./promise-status.js";
import { monitorPromise, combinePromises } from "./promise-status.js";
import { asError } from "./as-error";

const getPromiseStatusIterator = <Value>(
  promise: Promise<Value>,
  options: Partial<MonitorPromiseOptions> = {},
): AsyncIterator<PromiseState<Value>> => {
  const request = monitorPromise(promise, options);
  return request[Symbol.asyncIterator]();
};

const getNextValue = async <Value>(
  asyncIterator: AsyncIterator<Value>,
): Promise<Value> => {
  const result = await asyncIterator.next();
  if (!result.done) {
    return result.value;
  }
  throw new Error("Iterator is done.");
};

import { describe, expect, it, jest } from "@jest/globals";
describe("monitorPromise", () => {
  withFakeTimers();

  it("returns the result immediately if the promise is resolved.", async () => {
    const requestIterator = getPromiseStatusIterator(Promise.resolve("Apples"));

    const firstResult = await getNextValue(requestIterator);
    expect(firstResult).toStrictEqual({
      status: "complete",
      value: "Apples",
    });
  });

  it("returns the pending immediately if the promise is not resolved.", async () => {
    const requestIterator = getPromiseStatusIterator(echo("bananas", 10));

    const firstResult = await advanceToNextThenAwait(() =>
      getNextValue(requestIterator),
    );
    expect(firstResult).toStrictEqual({
      status: "pending",
    });
  });

  it("returns a pending request then the response once it resolves.", async () => {
    const requestIterator = getPromiseStatusIterator(echo("Carrots", 50));
    await advanceToNextThenAwait(() => getNextValue(requestIterator));
    jest.advanceTimersByTime(50);
    const nextResult = await getNextValue(requestIterator);
    expect(nextResult).toStrictEqual({
      status: "complete",
      value: "Carrots",
    });
  }, 500);

  it("once the response is returned the iterator terminates.", async () => {
    const requestIterator = getPromiseStatusIterator(Promise.resolve("Apples"));

    await getNextValue(requestIterator);
    await expect(getNextValue(requestIterator)).rejects.toStrictEqual(
      new Error("Iterator is done."),
    );
  });

  it("returns an error if the request fails.Converting the reason to an error along the way.", async () => {
    const errorResponse = { message: "Whoops!" };

    const requestIterator = getPromiseStatusIterator(
      // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
      Promise.reject(errorResponse),
    );

    const result = await getNextValue(requestIterator);
    expect(result).toStrictEqual({
      status: "failed",
      error: asError(errorResponse),
    });
  });

  it("returns an if the request takes longer than the timeout.", async () => {
    const requestIterator = getPromiseStatusIterator(echo("Pears", 501), {
      timeoutDelay: 50,
    });

    await advanceToNextThenAwait(() => getNextValue(requestIterator));

    const result = await advanceByTimeThenAwait(100, () =>
      getNextValue(requestIterator),
    );

    expect(result).toStrictEqual({
      status: "failed",
      error: new Error("Request timed out."),
    });
  });
});

describe("combinePromises", () => {
  const samples: {
    description: string;
    values: { [key: string]: unknown };
    expected: PromiseState;
  }[] = [
    {
      description: "forwards simple values",
      values: { string: "string", number: 1, object: { id: "{object}" } },
      expected: {
        status: "complete",
        value: { string: "string", number: 1, object: { id: "{object}" } },
      },
    },
    {
      description:
        "returns a complete promise if all the promises are complete.",
      values: {
        first: { status: "complete", value: 1 },
        second: { status: "complete", value: 2 },
      },
      expected: {
        status: "complete",
        value: { first: 1, second: 2 },
      },
    },
    {
      description:
        "returns a pending promise if one of the promises is pending.",
      values: {
        first: { status: "pending" },
        second: { status: "complete", value: 2 },
      },
      expected: { status: "pending" },
    },
    {
      description: "returns a failed if one of the promises has failed.",
      values: {
        first: { status: "failed", error: new Error("Whoops!") },
        second: { status: "pending" },
      },
      expected: { status: "failed", error: { first: new Error("Whoops!") } },
    },
    {
      description: "returns a failed if one of the promises has failed.",
      values: {
        first: { status: "failed", error: new Error("Whoops") },
        second: { status: "failed", error: new Error("Uh oh...") },
      },
      expected: {
        status: "failed",
        error: { first: new Error("Whoops"), second: new Error("Uh oh...") },
      },
    },
    {
      description: "flattens errors in child promises.",
      values: {
        first: { status: "failed", error: new Error("Whoops") },
        second: {
          status: "failed",
          error: { a: new Error("Uh oh..."), b: new Error("Really?") },
        },
      },
      expected: {
        status: "failed",
        error: {
          first: new Error("Whoops"),
          "second.a": new Error("Uh oh..."),
          "second.b": new Error("Really?"),
        },
      },
    },
  ];
  it.each(samples)("$description", ({ values, expected }) => {
    const combined = combinePromises(values);
    expect(combined).toStrictEqual(expected);
  });
});
