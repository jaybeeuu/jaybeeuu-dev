import fs from "fs";

export const deleteFile = (filePath: string): Promise<void> => fs.promises.unlink(filePath);

export const deleteDirectories = (...directories: string[]): Promise<void[]> => Promise.all(
  directories.map(async (directory) => {
    await fs.promises.rm(directory, { recursive: true, force: true });
  })
);
