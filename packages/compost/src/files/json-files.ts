import type { Result } from "@jaybeeuu/utilities";
import { failure, getErrorMessage, success } from "@jaybeeuu/utilities";
import { canAccess } from "./can-access.js";
import { readTextFile, writeTextFile } from "./text-files.js";

export type ReadJsonFileFailureReason =
  | "no access"
  | "parse error"
  | "validation failed";

export const readJsonFile = async <T>(
  filePath: string,
  isValid: (fileContent: unknown) => fileContent is T,
  defaultValue?: Exclude<T, undefined>,
): Promise<Result<T, ReadJsonFileFailureReason>> => {
  const haveAccess = await canAccess(filePath, "read");

  if (!haveAccess) {
    return defaultValue === undefined
      ? failure(
          "no access",
          "Could not access file. Either the file is missing or permission was denied.",
        )
      : success(defaultValue);
  }

  const fileContent = await readTextFile(filePath);

  let parsedFileContent: unknown;

  try {
    parsedFileContent = JSON.parse(fileContent);
  } catch (err) {
    return failure("parse error", `Failed to parse: ${getErrorMessage(err)}.`);
  }

  return isValid(parsedFileContent)
    ? success(parsedFileContent)
    : failure("validation failed");
};

export const writeJsonFile = async (
  filePath: string,
  data: unknown,
): Promise<void> => {
  const json = JSON.stringify(data, null, 2);

  return writeTextFile(filePath, json);
};
