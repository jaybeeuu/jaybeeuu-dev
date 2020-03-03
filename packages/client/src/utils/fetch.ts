type AsyncFetchResult = [true, Response] | [false, Error]

export const asyncFetch = (
  input: RequestInfo,
  init?: RequestInit
): Promise<AsyncFetchResult> => {
  return new Promise((resolve) => {
    fetch(input, init)
      .then((response: Response) => {
        resolve([true, response]);
      })
      .catch((error) => {
        resolve([false, error]);
      });
  });
};