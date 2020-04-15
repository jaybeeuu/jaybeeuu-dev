import fs from "fs";
import path from "path";

export const readTextFile = (filePath: string): Promise<string> => fs.promises.readFile(
  filePath,
  "utf8"
);

export const writeTextFile = async (filePath: string, data: string): Promise<void> => {
  await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
  return fs.promises.writeFile(
    filePath,
    data,
    "utf8"
  );
};