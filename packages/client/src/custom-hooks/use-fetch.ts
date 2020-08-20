import { useRef, useState, useEffect, Inputs } from "preact/hooks";
import { callFetch, FetchResult, FetchStatus } from "../utils/fetch";

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

export const useFetchAsset = <Response>(relativePath: string): FetchResult<Response> => {
  const [result, setResult]  = useState<FetchResult<Response>>({ status: FetchStatus.PENDING });

  useAsyncEffect(async (signal) => {
    for await ( const apiResult of callFetch<Response>(relativePath)) {
      if (signal.cancelled) {
        break;
      }
      setResult(apiResult);
    }
  }, []);

  return result;
};
