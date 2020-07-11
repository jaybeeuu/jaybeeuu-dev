import fs from "fs";

export const canAccess = async (file: string, mode?: number): Promise<boolean> => {
  try {
    await fs.promises.access(file, mode);
    return true;
  } catch {
    return false;
  }
};

export const ifCanAccess = async (
  source: string,
  action: () => Promise<void>
): Promise<void> => {
  if (await canAccess(source, fs.constants.R_OK)) {
    return action();
  }
};