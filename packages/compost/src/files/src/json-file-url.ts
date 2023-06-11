
import type { Result } from "@jaybeeuu/utilities";
import { failure, success } from "@jaybeeuu/utilities";
import type { Response } from "node-fetch";
import fetch, { FetchError } from "node-fetch";

export type FetchJsonFileFailureReason
  = "error"
  | "fetch failed"
  | "parse error"
  | "validation failed";

export const fetchJsonFile = async <T>(
  url: string,
  isValid: (fileContent: unknown) => fileContent is T
): Promise<Result<T, FetchJsonFileFailureReason>> => {
  let response: Response;
  try {
    response = await fetch(url);
  } catch (error) {
    if (error instanceof FetchError) {
      return failure(
        "fetch failed",
        [
          `Code: ${error.code ?? "(no code)"}`,
          `ErrorNo: ${error.errno ?? "(no errno)"}`,
          `Type: ${error.type}`,
          `Message: ${error.message}`,
          `Stack:\n${error.stack ?? "(no stack)"}`
        ].join("\n")
      );
    }

    return failure("error", error);
  }

  let parsedJson: unknown;

  try {
    parsedJson = await response.json();
  } catch (err) {
    return failure("parse error", err);
  }

  return isValid(parsedJson)
    ? success(parsedJson)
    : failure("validation failed");
};
