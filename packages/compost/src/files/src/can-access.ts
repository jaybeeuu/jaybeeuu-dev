import fs from "fs";

export enum Mode {
  /** File is visible to the calling process. */
  visible = fs.constants.F_OK,

  /** File can be read by the calling process. */
  read = fs.constants.R_OK,

  /** File can be written by the calling process. */
  write = fs.constants.W_OK,

  /** File can be executed by the calling process. */
  execute = fs.constants.X_OK
}

export const canAccess = async (file: string, mode?: Mode): Promise<boolean> => {
  try {
    await fs.promises.access(file, mode);
    return true;
  } catch {
    return false;
  }
};
