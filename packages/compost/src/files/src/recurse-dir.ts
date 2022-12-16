import type { Stats } from "fs";
import fs from "fs";
import path from "path";

export interface FileInfo {
  /**
   * The path relative to the drive root, without the file name and extension.
   */
  absolutePath: string;

  /**
   * The file name and extension, without the directory.
   */
  fileName: string;

  /**
   * The full absolute path and name of the file.
   */
  filePath: string;

  /**
   * The path and file name relative to the working directory.
   */
  relativeFilePath: string;

  /**
   * The path to the file relative to the working directory.
   */
  relativePath: string;

  /**
   * Node file stats.
   */
  stats: Stats;
}

export interface RecurseDirectoryOptions {
  exclude?: RegExp[];
  include?: RegExp[];
}

const innerRecurseDir = async function* (
  absolutePath: string,
  relativePath: string,
  options: RecurseDirectoryOptions = {}
): AsyncGenerator<FileInfo> {
  const { exclude = [], include = []} = options;

  const fileNames = await fs.promises.readdir(absolutePath);
  const excludeFile = (fileName: string): boolean => {

    if (!(include.length && include.some((includeEntry) => includeEntry.exec(fileName)))) {
      return true;
    }

    return exclude.some((excludeEntry) => excludeEntry.exec(fileName));
  };

  for (const fileName of fileNames) {
    const filePath =  path.join(absolutePath, fileName);
    const stats = await fs.promises.lstat(filePath);

    if (stats.isDirectory()) {
      yield* innerRecurseDir(filePath, path.join(relativePath, fileName), options);
      continue;
    }

    if (excludeFile(fileName)) {
      continue;
    }

    const fileInfo: FileInfo = {
      absolutePath,
      fileName,
      filePath,
      relativeFilePath: path.join(relativePath, fileName),
      relativePath,
      stats
    };

    yield fileInfo;
  }
};

// eslint-disable-next-line @typescript-eslint/require-await
export const recurseDirectory = async function* (
  directory: string,
  options?: RecurseDirectoryOptions
): AsyncGenerator<FileInfo> {
  yield* innerRecurseDir(directory, "/", options);
};
