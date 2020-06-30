jest.mock("../src/env", () => {
  const actualEnv = jest.requireActual("../src/env");
  const jestWorkerId = +(process.env.JEST_WORKER_ID || 0);
  const FILES_ROOT = `./fs/test/${jestWorkerId.toString()}`;
  const REMOTE_POST_REPO = `./fs/remote/test/${jestWorkerId.toString()}/.git`;

  const env = {
    ...actualEnv,
    API_HOST_NAME: "localhost",
    API_PORT: 5338 + jestWorkerId,
    CLIENT_HOST_NAME: "localhost",
    CLIENT_PORT: 5237 + jestWorkerId,
    NODE_ENV: process.env.NODE_ENV,
    REMOTE_POST_REPO,
    FILES_ROOT
  };

  // eslint-disable-next-line no-console
  console.log(`ENV ${jestWorkerId}:\n\n ${JSON.stringify(env, null, 2)}`);

  return env;
});