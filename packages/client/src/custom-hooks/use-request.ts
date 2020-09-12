import { useRef, useState, useEffect, Inputs, useMemo } from "preact/hooks";
import { makeTextRequest, makeJsonRequest, Request, RequestStatus } from "../utils/request";

const useAsyncEffect = (
  effect: ({ cancelled }: { cancelled: boolean }) => Promise<void>,
  dependencies: Inputs
): void => {
  const signal = useRef({ cancelled: false });
  useEffect(() => {
    signal.current.cancelled = false;
    void effect(signal.current);

    return () => {
      signal.current.cancelled = true;
    };
  }, dependencies);
};

type MakeIterable<Response> = (
  input: RequestInfo,
  init?: RequestInit
) => AsyncIterable<Request<Response>>;

const useRequest = <Response>(
  makeIterable: MakeIterable<Response>,
  input: RequestInfo,
  init?: RequestInit
): Request<Response> => {
  const [request, setRequest]  = useState<Request<Response>>({ status: RequestStatus.PENDING });

  const iterable = useMemo(
    () => makeIterable(input, init),
    [input, init]
  );

  useAsyncEffect(async (signal) => {
    for await ( const apiResult of iterable) {
      if (signal.cancelled) {
        break;
      }
      setRequest(apiResult);
    }
  }, [iterable]);

  return request;
};

export const useJsonRequest = <Response>(
  input: RequestInfo,
  init?: RequestInit
): Request<Response> => {
  return useRequest<Response>(makeJsonRequest, input, init);
};

export const useTextRequest = (
  input: RequestInfo,
  init?: RequestInit
): Request<string> => {
  return useRequest<string>(makeTextRequest, input, init);
};

