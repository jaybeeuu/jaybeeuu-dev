import { makeJsonRequest, Request, RequestStatus } from "./request";
import fetchMock from "fetch-mock";
import { asError } from "./as-error";

jest.useFakeTimers();

const requestUrl =  "/some-request" as "/some-request";
const healthyResponse = { success: true };
type HealthyResponse = typeof healthyResponse;

const getRequestIterator = <Response>(url: string): AsyncIterator<Request<Response>> => {
  const request = makeJsonRequest<Response>(url);
  return request[Symbol.asyncIterator]();
};

const getNextValue = async <Result>(asyncIterator: AsyncIterator<Result>): Promise<Result> => {
  const result = await asyncIterator.next();
  if (!result.done) {
    return result.value;
  }
  throw new Error("Iterator is done.");
};

describe("makeRequest", () => {
  beforeEach(() => {
    fetchMock.get(requestUrl, { status: 200, body: healthyResponse });
    fetchMock.config.overwriteRoutes = true;
  });

  it("returns a pending request then the response.", async () => {
    const requestIterator = getRequestIterator<HealthyResponse>(requestUrl);

    const firstResult = await getNextValue(requestIterator);
    expect(firstResult.status).toStrictEqual(RequestStatus.PENDING);

    const secondResult = await getNextValue(requestIterator);
    expect(secondResult).toStrictEqual({
      status: RequestStatus.COMPLETE,
      response: healthyResponse
    });
  });

  it("returns a slow request status if the request takes longer than 500ms.", async () => {
    fetchMock.get(requestUrl, { status: 200, body: healthyResponse }, { delay: 501 });

    const requestIterator = getRequestIterator<HealthyResponse>(requestUrl);

    const firstResult = await getNextValue(requestIterator);
    expect(firstResult.status).toStrictEqual(RequestStatus.PENDING);

    jest.advanceTimersByTime(500);

    const secondResult = await getNextValue(requestIterator);
    expect(secondResult).toStrictEqual({
      status: RequestStatus.LONG_RUNNING
    });

    jest.advanceTimersByTime(1);

    const thirdResult = await getNextValue(requestIterator);
    expect(thirdResult).toStrictEqual({
      status: RequestStatus.COMPLETE,
      response: healthyResponse
    });
  });

  it("returns an error if the request fails.", async () => {
    const errorResponse = { message: "Whoops!" };
    fetchMock.get(requestUrl, { status: 500, body: errorResponse });

    const requestIterator = getRequestIterator<HealthyResponse>(requestUrl);

    const firstResult = await getNextValue(requestIterator);
    expect(firstResult.status).toStrictEqual(RequestStatus.PENDING);

    const secondResult = await getNextValue(requestIterator);
    expect(secondResult).toStrictEqual({
      status: RequestStatus.FAILED,
      error: asError({
        status: 500,
        statusText: "Internal Server Error",
        body: errorResponse
      })
    });
  });
});
