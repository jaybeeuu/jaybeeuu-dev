import crypto from "crypto";
import fs, { Stats } from "fs";
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

interface RecurseDirectoryOptions {
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

const copyDir = async (
  sourcePath: string,
  destinationPath: string,
  options?: RecurseDirectoryOptions
): Promise<void> => {
  for await (const { stats, relativePath, name, file } of recurseDirectory(sourcePath, options)) {
    const destination = path.join(destinationPath, relativePath, name);
    if (stats.isDirectory()) {
      await fs.promises.mkdir(destination, { recursive: true });
    } else if (stats.isSymbolicLink()) {
      const symlink = await fs.promises.readlink(file);
      await fs.promises.symlink(symlink, destination);
    } else if (stats.isFile()) {
      await fs.promises.copyFile(file, destination);
    }
  }
};

const copyDirIfSourceExists = async (
  source: string,
  destination: string,
  options?: RecurseDirectoryOptions
): Promise<void> => {
  try {
    await fs.promises.access(source, fs.constants.R_OK);
    return copyDir(source, destination, options);
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


// Algorithm depends on availability of OpenSSL on platform
// Another algorithms: 'sha1', 'md5', 'sha256', 'sha512' ...
const algorithm = "sha1";

const getFileHash = (filename: string): Promise<string> => {
  const hash = crypto.createHash(algorithm);

  return new Promise((resolve) => {
    const stream = fs.createReadStream(filename);
    stream.on("data", (data) => {
      hash.update(data);
    });

    stream.on("end", () => {
      resolve(hash.digest("hex"));
    });
  });
};

export interface FileHashMap {
  [file: string]: string
}

export const getFileHashes = async (
  directory: string,
  options?: RecurseDirectoryOptions
): Promise<{ [file: string]: string }> => {
  const hashes: FileHashMap = {};

  for await (const { stats, file, name, relativePath } of recurseDirectory(directory, options)) {
    if (stats.isFile()) {
      hashes[path.join(relativePath, name)] = await getFileHash(file);
    }
  }

  return hashes;
};
