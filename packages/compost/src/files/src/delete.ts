import fs from "fs";
import rmfr from "rmfr";
import { canAccess } from "./can-access";

export const deleteFile = (filePath: string): Promise<void> => fs.promises.unlink(filePath);

export const deleteDirectories = (...directories: string[]): Promise<void[]> => Promise.all(
  directories.map(async (directory) => {
    if (await canAccess(directory)) {
      await rmfr(directory);
    }
  })
);
