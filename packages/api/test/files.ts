import crypto from "crypto";
import fs from "fs";
import rmfr from "rmfr";
import path from "path";
import { FILES_ROOT } from "../src/env";
import { recurseDirectory, RecurseDirectoryOptions } from "../src/files/index";

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
