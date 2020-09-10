import { useRef, useState, useEffect, Inputs } from "preact/hooks";
import { makeTextRequest, makeJsonRequest, Request, RequestStatus } from "../utils/request";

const useAsyncEffect = (
  effect: ({ cancelled }: { cancelled: boolean }) => Promise<void>,
  dependencies: Inputs
): void => {
  const signal = useRef({ cancelled: false });
  useEffect(() => {
    void effect(signal.current);
    return () => {
      signal.current.cancelled = true;
    };
  }, dependencies);
};

const useRequestIterable = <Response>(iterable: AsyncIterable<Request<Response>>): Request<Response> => {
  const [request, setRequest]  = useState<Request<Response>>({ status: RequestStatus.PENDING });

  useAsyncEffect(async (signal) => {
    for await ( const apiResult of iterable) {
      if (signal.cancelled) {
        break;
      }
      setRequest(apiResult);
    }
  }, []);

  return request;
};

export const useJsonRequest = <Response>(
  input: RequestInfo,
  init?: RequestInit
): Request<Response> => {
  return useRequestIterable(makeJsonRequest<Response>(input, init));
};

export const useTextRequest = (
  input: RequestInfo,
  init?: RequestInit
): Request<string> => {
  return useRequestIterable(makeTextRequest(input, init));
};

