import env from "../src/env";

jest.mock("../src/env", () => {
  const jestWorkerId: number = +(process.env.JEST_WORKER_ID || 0);
  return {
    API_HOST_NAME: "localhost",
    API_PORT: 5338 + jestWorkerId,
    CLIENT_HOST_NAME: "localhost",
    CLIENT_PORT: 5237 + jestWorkerId,
    NODE_ENV: process.env.NODE_ENV,
    POST_REPO_DIRECTORY: "./test/integration/fs/local",
    POST_REPO_REMOTE: "./test/integration/fs/remote/.git",
    POST_DIST_DIRECTORY: "./test/integration/fs/dist"
  };
});

export default env;
