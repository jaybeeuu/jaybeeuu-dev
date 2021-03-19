import fs from "fs";

export const canAccess = async (file: string, mode?: number): Promise<boolean> => {
  try {
    await fs.promises.access(file, mode);
    return true;
  } catch {
    return false;
  }
};
