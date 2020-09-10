import { asError } from "./as-error";

export enum RequestStatus {
  PENDING = "pending",
  LONG_RUNNING = "long-running",
  FAILED =  "failed",
  COMPLETE = "complete"
}

export interface PendingRequest {
  status: RequestStatus.PENDING;
}

export interface LongRunningRequest {
  status: RequestStatus.LONG_RUNNING;
}

export interface FailedRequest {
  status: RequestStatus.FAILED;
  error: Error;
}

export interface Complete<Response> {
  status: RequestStatus.COMPLETE;
  response: Response;
}

export type Request<Response> = PendingRequest | LongRunningRequest | FailedRequest | Complete<Response>;

const echoDelayed = <Value>(value: Value, delay: number): Promise<Value> => {
  return new Promise((resolve) => setTimeout(() => resolve(value), delay));
};

const fetchRequest = <ResponseContent>(parseResponse: (response: Response) => Promise<ResponseContent>) => async (
  input: RequestInfo,
  init?: RequestInit
): Promise<Request<ResponseContent>> => {
  try {
    const response = await fetch(input, init);
    if (!response.ok) {
      throw asError({
        status: response.status,
        statusText: response.statusText,
        body: await response.text() as unknown
      });
    }
    return {
      status: RequestStatus.COMPLETE,
      response: await parseResponse(response)
    };
  } catch (error) {
    return {
      status: RequestStatus.FAILED,
      error: asError(error)
    };
  }
};

const fetchJsonRequest = async <ResponseContent>(
  input: RequestInfo,
  init?: RequestInit
): Promise<Request<ResponseContent>> => {
  return fetchRequest<ResponseContent>(async <ResponseContent>(response: Response): Promise<ResponseContent> => {
    return await response.json() as ResponseContent;
  })(input, init);
};

const fetchTextRequest = fetchRequest(async (response: Response): Promise<string> => {
  return response.text();
});

async function* makeRequestGenerator<Response> (
  req: Promise<Request<Response>>
): AsyncIterable<Request<Response>> {
  const longRunning = echoDelayed<Request<Response>>({ status: RequestStatus.LONG_RUNNING }, 500);
  const timeout = echoDelayed<Request<Response>>({ status: RequestStatus.FAILED, error: new Error("Request timed out.") }, 5000);

  yield { status: RequestStatus.PENDING };

  const nextResult = await Promise.race([req, timeout, longRunning]);

  yield nextResult;

  if (nextResult.status !== RequestStatus.LONG_RUNNING) {
    return;
  }

  yield await Promise.race([req, timeout]);
}

export function makeJsonRequest<Response> (
  input: RequestInfo,
  init?: RequestInit
): AsyncIterable<Request<Response>> {
  const req = fetchJsonRequest<Response>(input, init);
  return makeRequestGenerator(req);
}

export function makeTextRequest (
  input: RequestInfo,
  init?: RequestInit
): AsyncIterable<Request<string>> {
  const req = fetchTextRequest(input, init);
  return makeRequestGenerator(req);
}
