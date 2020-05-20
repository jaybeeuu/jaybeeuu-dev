import { useRef, useState, useEffect, Inputs } from "preact/hooks";
import { API_HOST_NAME, API_PORT } from "../env";
import { callApi, ApiCallResult, ApiCallStatus } from "../utils/api";

const baseUrl = new URL(`https://${API_HOST_NAME}:${API_PORT}`);

const formaatUrl = (relativePath: string): string => {
  return new URL(relativePath, baseUrl).toString();
};

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

export const useApiCall = (relativePath: string, dependencies: Inputs): ApiCallResult => {
  const [result, setResult]  = useState<ApiCallResult>({ status: ApiCallStatus.PENDING });

  useAsyncEffect(async (signal) => {
    for await ( const result of callApi(formaatUrl(relativePath))) {
      if (signal.cancelled) {
        break;
      }
      setResult(result);
    }
  }, dependencies);

  return result;
};