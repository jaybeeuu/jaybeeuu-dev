import fs from "fs";

export const deleteFile = (filePath: string): Promise<void> =>
  fs.promises.unlink(filePath);

export const deleteDirectories = async (
  ...directories: string[]
): Promise<void> => {
  await Promise.all(
    directories.map(async (directory) => {
      await fs.promises.rm(directory, { recursive: true, force: true });
    }),
  );
};
