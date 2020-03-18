import { promises as fs } from"fs";
import rmfr from "rmfr";
import { POST_DIST_DIRECTORY, POST_REPO_DIRECTORY, REMOTE_POST_REPO_DIRECTORY } from "./mock-env";
import path from "path";

const copyDir = async (sourcePath: string, destinationPath: string): Promise<void> => {
  await fs.mkdir(destinationPath);

  const files = await fs.readdir(sourcePath);
  await Promise.all(files.map(async (file) => {
    const fileStats = await fs.lstat(path.join(sourcePath, file));
    const sourceFile =  path.join(sourcePath, file);
    const destinationFile =  path.join(destinationPath, file);

    if (fileStats.isDirectory()) {
      await copyDir(sourceFile, destinationFile);
    } else if(fileStats.isSymbolicLink()) {
      const symlink = await fs.readlink(sourceFile);
      await fs.symlink(symlink, destinationFile);
    } else {
      await fs.copyFile(sourceFile, destinationFile);
    }
  }));
};

export const setupDirectories = ({
  postDistSourceDirectory,
  postRepoSourceDirectory,
  remotePostRepoSourceDirectory
}: {
  postDistSourceDirectory: string,
  postRepoSourceDirectory: string,
  remotePostRepoSourceDirectory: string
}): Promise<[void, void, void]> => Promise.all([
  copyDir(postDistSourceDirectory, POST_DIST_DIRECTORY),
  copyDir(postRepoSourceDirectory, POST_REPO_DIRECTORY),
  copyDir(remotePostRepoSourceDirectory, REMOTE_POST_REPO_DIRECTORY)
]);

export const cleanUpDirectories = (): Promise<[void, void, void]> => Promise.all([
  rmfr(POST_DIST_DIRECTORY),
  rmfr(POST_REPO_DIRECTORY),
  rmfr(REMOTE_POST_REPO_DIRECTORY)
]);
