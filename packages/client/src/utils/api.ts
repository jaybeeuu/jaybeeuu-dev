export enum ApiCallStatus {
  PENDING = "pending",
  LONG_RUNNING = "long-running",
  FAILED =  "failed",
  COMPLETE = "complete"
}


export interface PendingRequest {
  status: ApiCallStatus.PENDING;
}

export interface LongRunningRequest {
  status: ApiCallStatus.LONG_RUNNING;
}

export interface FailedRequest {
  status: ApiCallStatus.FAILED;
  error: Error;
}

export interface Complete {
  status: ApiCallStatus.COMPLETE;
  response: any;
}

export type ApiCallResult = PendingRequest | LongRunningRequest | FailedRequest | Complete;

const echoDelayed = <Value>(value: Value, delay: number): Promise<Value> => {
  return new Promise((resolve) => setTimeout(() => resolve(value), delay));
};

const makeRequest = async (
  input: RequestInfo,
  init?: RequestInit
): Promise<ApiCallResult> => {
  try {
    const response = await fetch(input, init);
    return { status: ApiCallStatus.COMPLETE, response: await response.json() };
  } catch (error) {
    return { status: ApiCallStatus.FAILED, error };
  }
};

export async function* callApi (
  input: RequestInfo,
  init?: RequestInit
): AsyncIterable<ApiCallResult> {
  const request = makeRequest(input, init);
  const longRunning = echoDelayed<ApiCallResult>({ status: ApiCallStatus.LONG_RUNNING }, 500);
  const timeout = echoDelayed<ApiCallResult>({ status: ApiCallStatus.FAILED, error: new Error("Request timed out.") }, 5000);

  yield { status: ApiCallStatus.PENDING };

  const nextResult = await Promise.race([request, timeout, longRunning]);

  yield nextResult;

  if (nextResult.status !== ApiCallStatus.LONG_RUNNING) {
    return;
  }

  yield await Promise.race([request, timeout]);
}
