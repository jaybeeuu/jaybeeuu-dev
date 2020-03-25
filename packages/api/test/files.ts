import crypto from "crypto";
import fs from "fs";
import rmfr from "rmfr";
import path from "path";
import { postDistDirectory, postRepoDirectory, resolveApp } from "../src/paths";
import { REMOTE_POST_REPO_DIRECTORY, REMOTE_POST_REPO, FILES_ROOT } from "../src/env";
import { recurseDirectory, RecurseDirectoryOptions, ifCanAccess } from "../src/files/index";

const remotePostRepoDirectory = resolveApp(REMOTE_POST_REPO_DIRECTORY);

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
): Promise<void> => ifCanAccess(
  source,
  () => copyDir(source, destination, options)
);

const replaceInFile = async (
  filePath: string,
  searchTerm: string | RegExp,
  replaceValue: string
): Promise<void> => {
  const fileContent = await fs.promises.readFile(filePath, "utf8");
  fileContent.replace(searchTerm, replaceValue);
  await fs.promises.writeFile(filePath, fileContent, { encoding: "utf8" });
};

export const setupDirectories = async (
  testFileDir: string
): Promise<[void, void, void]> => {
  const testRemoteRepoDirectory = path.join(testFileDir, "remote");
  const repoDir = path.join(testFileDir, "repo");

  return Promise.all([
    copyDirIfSourceExists(path.join(testFileDir, "dist"), postDistDirectory),
    ifCanAccess(repoDir, async () => {
      await copyDir(repoDir, postRepoDirectory);
      await replaceInFile(
        path.join(postRepoDirectory, ".git", "config"),
        new RegExp(path.join(testRemoteRepoDirectory, ".git"), "g"),
        REMOTE_POST_REPO
      );
    }),
    copyDirIfSourceExists(testRemoteRepoDirectory, remotePostRepoDirectory)
  ]);
};

export const cleanUpDirectories = (): Promise<void> => rmfr(FILES_ROOT);

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
