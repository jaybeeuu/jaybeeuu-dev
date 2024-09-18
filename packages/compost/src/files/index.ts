export { canAccess, canAccessSync, Mode } from "./can-access.js";
export { deleteFile, deleteDirectories } from "./delete.js";
export {
  readJsonFile,
  ReadJsonFileFailureReason,
  writeJsonFile,
} from "./json-files.js";
export { fetchJsonFile, FetchJsonFileFailureReason } from "./json-file-url.js";
export {
  FileInfo,
  RecurseDirectoryOptions,
  recurseDirectory,
} from "./recurse-dir.js";
export {
  File,
  readTextFile,
  readTextFileSync,
  writeTextFile,
  writeTextFiles,
} from "./text-files.js";

import fs from "fs";
const { copyFile } = fs.promises;
export { copyFile };
