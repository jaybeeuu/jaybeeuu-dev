import fs from "fs";
import { canAccess } from "./can-access.js";

export const deleteFile = (filePath: string): Promise<void> => fs.promises.unlink(filePath);

export const deleteDirectories = (...directories: string[]): Promise<void[]> => Promise.all(
  directories.map(async (directory) => {
    if (await canAccess(directory)) {
      await fs.promises.rm(directory, { recursive: true, force: true });
    }
  })
);
