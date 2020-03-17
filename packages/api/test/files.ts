import fs from"fs";
import rimraf from "rimraf";
import { POST_DIST_DIRECTORY, POST_REPO_DIRECTORY, REMOTE_POST_REPO_DIRECTORY } from "./mock-env";

const rimrafPromise = (path: string): Promise<void> => new Promise((resolve, reject) => {
  rimraf(path, (error) => {
    if (error) {
      reject(error);
    }
    resolve();
  });
});

export const cleanUpFiles = (): Promise<[void, void, void]> => Promise.all([
  rimrafPromise(POST_DIST_DIRECTORY),
  rimrafPromise(POST_REPO_DIRECTORY),
  rimrafPromise(REMOTE_POST_REPO_DIRECTORY)
]);

var copyDir = function(sourcePath: string, destinationPath: string) {
	fs.mkdtemp(destinationPath)
	var files = fs.readdirSync(sourcePath);
	files.forEach((file) => {
		var current = fs.lstatSync(path.join(sourcePath, files[i]));
		if(current.isDirectory()) {
			copyDir(path.join(sourcePath, files[i]), path.join(destinationPath, files[i]));
		} else if(current.isSymbolicLink()) {
			var symlink = fs.readlinkSync(path.join(sourcePath, files[i]));
			fs.symlinkSync(symlink, path.join(destinationPath, files[i]));
		} else {
			copy(path.join(sourcePath:, files[i]), path.join(destinationPath, files[i]));
		}
	}
};

export const setupDirectories = ({
  postDistSourceDirectory,
  postRepoSourceDirectory,
  remotePostRepoSourceDirectory
}: {
  postDistDirectory: string,
  postRepoDirectory: string,
  remotePostRepoDirectory: string
}): Promise<[void, void, void]> => Promise.all([
  fs.(POST_DIST_DIRECTORY),
  rimrafPromise(POST_REPO_DIRECTORY),
  rimrafPromise(REMOTE_POST_REPO_DIRECTORY)
]);

