export { canAccess, canAccessSync, type Mode } from "./can-access.js";
export { deleteDirectories, deleteFile } from "./delete.js";
export {
  fetchJsonFile,
  type FetchJsonFileFailureReason,
} from "./json-file-url.js";
export {
  readJsonFile,
  writeJsonFile,
  type ReadJsonFileFailureReason,
} from "./json-files.js";
export {
  recurseDirectory,
  type FileInfo,
  type RecurseDirectoryOptions,
} from "./recurse-dir.js";
export {
  readTextFile,
  readTextFileSync,
  writeTextFile,
  writeTextFiles,
  type File,
} from "./text-files.js";
export { copyFile };

import fs from "node:fs";
const { copyFile } = fs.promises;
