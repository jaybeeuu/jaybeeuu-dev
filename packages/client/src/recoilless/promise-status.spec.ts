import { monitorPromise, PromiseState, combinePromises } from "./promise-status";
import { asError } from "../utils/as-error";
import { echoDelayed } from "@bickley-wallace/utilities";

jest.useFakeTimers();

const getIterator = <Value>(promise: Promise<Value>): AsyncIterator<PromiseState<Value>> => {
  const request = monitorPromise(promise);
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
    const requestIterator = getIterator(Promise.resolve("Apples"));

    const firstResult = await getNextValue(requestIterator);
    expect(firstResult.status).toStrictEqual("pending");

    const secondResult = await getNextValue(requestIterator);
    expect(secondResult).toStrictEqual({
      status: "complete",
      value: "Apples"
    });
  });

  it("returns a slow request status if the request takes longer than 500ms.", async () => {
    const requestIterator = getIterator(echoDelayed("Pears", 501));

    const firstResult = await getNextValue(requestIterator);
    expect(firstResult.status).toStrictEqual("pending");

    jest.advanceTimersByTime(500);

    const secondResult = await getNextValue(requestIterator);
    expect(secondResult).toStrictEqual({
      status: "slow"
    });

    jest.advanceTimersByTime(1);

    const thirdResult = await getNextValue(requestIterator);
    expect(thirdResult).toStrictEqual({
      status: "complete",
      value: "Pears"
    });
  });

  it("returns an error if the request fails.", async () => {
    const errorResponse = { message: "Whoops!" };

    const requestIterator = getIterator(Promise.reject(errorResponse));

    const firstResult = await getNextValue(requestIterator);
    expect(firstResult.status).toStrictEqual("pending");

    const secondResult = await getNextValue(requestIterator);
    expect(secondResult).toStrictEqual({
      status: "failed",
      error: asError(errorResponse)
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
      values: { first: { status: "failed", error: new Error("Whoops") }, second: { status: "failed", error: new Error("Uh oh...") } },
      expected: { status: "failed", error: { first: new Error("Whoops"), second: new Error("Uh oh...") } }
    }
  ];
  samples.forEach(({ description, values, expected }) => {
    it(`${description}`, () => {
      const combined = combinePromises(values);
      expect(combined).toStrictEqual(expected);
    });
  });
});
