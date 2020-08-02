import { readTextFile, writeTextFile } from "./text-files";
import { canAccess } from "..";

export const readJsonFile = async <T>(filePath: string, deflt: T): Promise<T> => {
  return await canAccess(filePath)
    ? JSON.parse(await readTextFile(filePath))
    : deflt;
};

export const writeJsonFile = async (filePath: string, data: unknown): Promise<void> => {
  const json = JSON.stringify(data, null, 2);

  return writeTextFile(filePath, json);
};
