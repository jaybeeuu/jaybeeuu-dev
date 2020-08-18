export enum FetchStatus {
  PENDING = "pending",
  LONG_RUNNING = "long-running",
  FAILED =  "failed",
  COMPLETE = "complete"
}


export interface PendingRequest {
  status: FetchStatus.PENDING;
}

export interface LongRunningRequest {
  status: FetchStatus.LONG_RUNNING;
}

export interface FailedRequest {
  status: FetchStatus.FAILED;
  error: Error;
}

export interface Complete<Response> {
  status: FetchStatus.COMPLETE;
  response: Response;
}

export type FetchResult<Response> = PendingRequest | LongRunningRequest | FailedRequest | Complete<Response>;

const echoDelayed = <Value>(value: Value, delay: number): Promise<Value> => {
  return new Promise((resolve) => setTimeout(() => resolve(value), delay));
};

const makeRequest = async <Response>(
  input: RequestInfo,
  init?: RequestInit
): Promise<FetchResult<Response>> => {
  try {
    const response = await fetch(input, init);
    return { status: FetchStatus.COMPLETE, response: await response.json() };
  } catch (error) {
    return { status: FetchStatus.FAILED, error };
  }
};

export async function* callFetch<Response> (
  input: RequestInfo,
  init?: RequestInit
): AsyncIterable<FetchResult<Response>> {
  const request = makeRequest<Response>(input, init);
  const longRunning = echoDelayed<FetchResult<Response>>({ status: FetchStatus.LONG_RUNNING }, 500);
  const timeout = echoDelayed<FetchResult<Response>>({ status: FetchStatus.FAILED, error: new Error("Request timed out.") }, 5000);

  yield { status: FetchStatus.PENDING };

  const nextResult = await Promise.race([request, timeout, longRunning]);

  yield nextResult;

  if (nextResult.status !== FetchStatus.LONG_RUNNING) {
    return;
  }

  yield await Promise.race([request, timeout]);
}
