import { useObservable } from "./useObservable";
import env from "../env";
import { ajax, AjaxResponse, AjaxRequest } from "rxjs/ajax";
import { useRef } from "react";

const { CLIENT_HOST_NAME, CLIENT_PORT, API_HOST_NAME, API_PORT } = env;

const apiUrl = new URL(`https://${API_HOST_NAME}:${API_PORT}`);
const clientUrl = new URL(`https://${CLIENT_HOST_NAME}:${CLIENT_PORT}`);
const baseRequest: Partial<AjaxRequest> = {
  crossDomain: clientUrl.toString() !== apiUrl.toString()
};

const getApiUrl = (relativePath: string): string => new URL(relativePath, apiUrl).toString();

export const useApiCall = (relativePath: string): AjaxResponse | undefined => {
  const request: AjaxRequest = {
    ...baseRequest,
    url: getApiUrl(relativePath)
  };

  const call = useRef(ajax(request));

  return useObservable(call.current);
};