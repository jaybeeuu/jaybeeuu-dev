export {
  API_HOST_NAME,
  API_PORT,
  CLIENT_HOST_NAME,
  CLIENT_PORT,
  NODE_ENV,
  POST_DIST_DIRECTORY,
  POST_REPO_DIRECTORY,
  REMOTE_POST_REPO,
  REMOTE_POST_REPO_DIRECTORY
} from "../src/env";

jest.mock("../src/env", () => {
  const jestWorkerId = +(process.env.JEST_WORKER_ID || 0);
  const FILES_ROOT = `./fs/test/${jestWorkerId.toString()}`;
  const REMOTE_POST_REPO_DIRECTORY = `${FILES_ROOT}/remote`;

  return {
    API_HOST_NAME: "localhost",
    API_PORT: 5338 + jestWorkerId,
    CLIENT_HOST_NAME: "localhost",
    CLIENT_PORT: 5237 + jestWorkerId,
    NODE_ENV: process.env.NODE_ENV,
    POST_REPO_DIRECTORY: `${FILES_ROOT}/repo`,
    REMOTE_POST_REPO: `${REMOTE_POST_REPO_DIRECTORY}/.git`,
    REMOTE_POST_REPO_DIRECTORY,
    POST_DIST_DIRECTORY: `${FILES_ROOT}/dist`,
    FILES_ROOT
  };
});

declare module "../src/env" {
  export const REMOTE_POST_REPO_DIRECTORY: string;
  export const FILES_ROOT: string;
}