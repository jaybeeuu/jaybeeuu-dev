import crypto from "crypto";
import fs from "fs";
import rmfr from "rmfr";
import path from "path";

import { recurseDirectory, RecurseDirectoryOptions } from "../src/files/index";
import { REMOTE_POST_REPO, FILES_ROOT } from "../src/env";

export const getRemoteRepoDirectory = (): string => path.resolve(REMOTE_POST_REPO.replace(/\/.git$/, ""));

export const cleanUpDirectories = (): Promise<void[]> => Promise.all([
  rmfr(path.resolve(FILES_ROOT)),
  rmfr(getRemoteRepoDirectory())
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
