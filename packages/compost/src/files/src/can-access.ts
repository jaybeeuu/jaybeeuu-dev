import fs from "fs";

export type Mode =
  /** File is visible to the calling process. */
  | "visible"
  /** File can be read by the calling process. */
  | "read"
  /** File can be written by the calling process. */
  | "write"
  /** File can be executed by the calling process. */
  | "execute";

const modeFsConstMap = {
  /** File is visible to the calling process. */
  visible: fs.constants.F_OK,

  /** File can be read by the calling process. */
  read: fs.constants.R_OK,

  /** File can be written by the calling process. */
  write: fs.constants.W_OK,

  /** File can be executed by the calling process. */
  execute: fs.constants.X_OK
} satisfies { [mode in Mode]: number };

export const canAccessSync = (file: string, mode?: Mode): boolean => {
  try {
    fs.accessSync(file, mode && modeFsConstMap[mode]);
    return true;
  } catch {
    return false;
  }
};

export const canAccess = async (file: string, mode?: Mode): Promise<boolean> => {
  try {
    await fs.promises.access(file, mode && modeFsConstMap[mode]);
    return true;
  } catch {
    return false;
  }
};
