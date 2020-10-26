import { monitorPromise, PromiseState } from "./promise-status";
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

describe("makeRequest", () => {
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
