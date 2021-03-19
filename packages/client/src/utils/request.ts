import { asError } from "@bickley-wallace/utilities";

const fetchRequest = <ResponseContent>(parseResponse: (response: Response) => Promise<ResponseContent>) => async (
  input: RequestInfo,
  init?: RequestInit
): Promise<ResponseContent> => {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw asError({
      status: response.status,
      statusText: response.statusText,
      body: await response.text() as unknown
    });
  }
  return await parseResponse(response);
};

export const fetchJson = async <ResponseContent>(
  input: RequestInfo,
  init?: RequestInit
): Promise<ResponseContent> => {
  return fetchRequest(async (response: Response): Promise<ResponseContent> => {
    return await response.json() as ResponseContent;
  })(input, init);
};

export const fetchText = fetchRequest(async (response: Response): Promise<string> => {
  return response.text();
});
