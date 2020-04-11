import rmfr from "rmfr";
import path from "path";

import { REMOTE_POST_REPO, FILES_ROOT } from "../src/env";

export const getRemoteRepoDirectory = (): string => path.resolve(REMOTE_POST_REPO.replace(/\/.git$/, ""));

export const cleanUpDirectories = (): Promise<void[]> => Promise.all([
  rmfr(path.resolve(FILES_ROOT)),
  rmfr(getRemoteRepoDirectory())
]);