import { useRef, useState, useEffect, Inputs } from "preact/hooks";
import { callApi, ApiCallResult, ApiCallStatus } from "../utils/api";

const useAsyncEffect = (
  effect: ({ cancelled }: { cancelled: boolean }) => Promise<void>,
  dependencies: Inputs
): void => {
  const signal = useRef({ cancelled: false });
  useEffect(() => {
    effect(signal.current);
    return () => {
      signal.current.cancelled = true;
    };
  }, dependencies);
};

export const useApiCall = (relativePath: string): ApiCallResult => {
  const [result, setResult]  = useState<ApiCallResult>({ status: ApiCallStatus.PENDING });

  useAsyncEffect(async (signal) => {
    for await ( const apiResult of callApi(relativePath)) {
      if (signal.cancelled) {
        break;
      }
      setResult(apiResult);
    }
  }, []);

  return result;
};