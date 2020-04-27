import fs from "fs";

export const deleteFile = (filePath: string): Promise<void> => fs.promises.unlink(filePath);

