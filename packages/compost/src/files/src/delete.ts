import fs from "fs";
import rmfr from "rmfr";

export const deleteFile = (filePath: string): Promise<void> => fs.promises.unlink(filePath);

export const deleteDirectories = (...directories: string[]): Promise<void[]> => Promise.all(
  directories.map((directory) => rmfr(directory))
);
