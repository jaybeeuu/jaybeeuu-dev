import { promises as fs, constants as fsConstants, Stats } from"fs";
import rmfr from "rmfr";
import path from "path";
import { postDistDirectory, postRepoDirectory, resolveApp } from "../src/paths";
import { REMOTE_POST_REPO_DIRECTORY } from "../src/env";

const remotePostRepoDirectory = resolveApp(REMOTE_POST_REPO_DIRECTORY);

interface FileInfo {
  directory: string;
  name: string;
  file: string;
  relativePath: string;
  stats: Stats;
}

type OnFileAction = (
  fileInfo: FileInfo
) => Promise<void>;

const innerRecurseDir = async function* (directory: string, relativePath: string): AsyncGenerator<FileInfo> {
  const fileNames = await fs.readdir(directory);

  for (const fileName of fileNames) {
    const file =  path.join(directory, fileName);
    const stats = await fs.lstat(file);
    const fileInfo = {
      directory,
      name: fileName,
      relativePath,
      file,
      stats
    };

    yield fileInfo;
    if (stats.isDirectory()) {
      yield* innerRecurseDir(file, path.join(relativePath, fileName));
    }
  }
};

// eslint-disable-next-line @typescript-eslint/require-await
export const recurseDirectory = async function* (directory: string): AsyncGenerator<FileInfo> {
  yield* innerRecurseDir(directory, "/");
};

const copyDir = async (
  sourcePath: string,
  destinationPath: string
): Promise<void> => {
  for await (const { stats, relativePath, name, file } of recurseDirectory(sourcePath)) {
    const destination = path.join(destinationPath, relativePath, name);
    if (stats.isDirectory()) {
      await fs.mkdir(destination, { recursive: true });
    } else if (stats.isSymbolicLink()) {
      const symlink = await fs.readlink(file);
      await fs.symlink(symlink, destination);
    } else if (stats.isFile()) {
      await fs.copyFile(file, destination);
    }
  }
};

const copyDirIfSourceExists = async (source: string, destination: string): Promise<void> => {
  try {
    await fs.access(source, fsConstants.R_OK);
    return copyDir(source, destination);
  } catch {
    return;
  }
};

export const setupDirectories = async (
  testFileDir: string
): Promise<[void, void, void]> => {
  return Promise.all([
    copyDirIfSourceExists(path.join(testFileDir, "dist"), postDistDirectory),
    copyDirIfSourceExists(path.join(testFileDir, "repo"), postRepoDirectory),
    copyDirIfSourceExists(path.join(testFileDir, "remote"), remotePostRepoDirectory)
  ]);
};

export const cleanUpDirectories = (): Promise<[void, void, void]> => Promise.all([
  rmfr(postDistDirectory),
  rmfr(postRepoDirectory),
  rmfr(REMOTE_POST_REPO_DIRECTORY)
]);