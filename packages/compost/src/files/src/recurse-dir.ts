import fs, { Stats } from "fs";
import path from "path";

export interface FileInfo {
  /**
   * THe absolute
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
   * The relative path to the file from the working directory.
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
    return exclude.some((excludeEntry) => excludeEntry.exec(fileName))
      && !include.some((includeEntry) => includeEntry.exec(fileName));
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
      relativePath,
      filePath,
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