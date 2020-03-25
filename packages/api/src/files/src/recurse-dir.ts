import fs, { Stats } from "fs";
import path from "path";

interface FileInfo {
  directory: string;
  name: string;
  file: string;
  relativePath: string;
  stats: Stats;
}

export interface RecurseDirectoryOptions {
  exclude?: RegExp[]
}

const innerRecurseDir = async function* (
  directory: string,
  relativePath: string,
  options: RecurseDirectoryOptions = {}
): AsyncGenerator<FileInfo> {
  const { exclude = [] } = options;

  const fileNames = await fs.promises.readdir(directory);
  const filteredFileNames = fileNames.filter(
    (fileName) => !exclude.some((excludeEntry) => excludeEntry.exec(fileName))
  );

  for (const fileName of filteredFileNames) {
    const file =  path.join(directory, fileName);
    const stats = await fs.promises.lstat(file);
    const fileInfo = {
      directory,
      name: fileName,
      relativePath,
      file,
      stats
    };

    yield fileInfo;

    if (stats.isDirectory()) {
      yield* innerRecurseDir(file, path.join(relativePath, fileName), options);
    }
  }
};

// eslint-disable-next-line @typescript-eslint/require-await
export const recurseDirectory = async function* (
  directory: string,
  options?: RecurseDirectoryOptions
): AsyncGenerator<FileInfo> {
  yield* innerRecurseDir(directory, "/", options);
};