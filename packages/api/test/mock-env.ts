jest.mock("../src/env", () => {
  const jestWorkerId = +(process.env.JEST_WORKER_ID || 0);
  const FILES_ROOT = `./fs/test/${jestWorkerId.toString()}`;
  const REMOTE_POST_REPO_DIRECTORY = `./fs/remote/test/${jestWorkerId.toString()}`;

  return {
    API_HOST_NAME: "localhost",
    API_PORT: 5338 + jestWorkerId,
    CLIENT_HOST_NAME: "localhost",
    CLIENT_PORT: 5237 + jestWorkerId,
    NODE_ENV: process.env.NODE_ENV,
    REMOTE_POST_REPO: `${REMOTE_POST_REPO_DIRECTORY}/.git`,
    FILES_ROOT
  };
});