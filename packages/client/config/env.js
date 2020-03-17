const dotenv = require("dotenv");

dotenv.config();

const acceptedEnvVars = [
  "CLIENT_HOST_NAME",
  "CLIENT_PORT",
  "API_HOST_NAME",
  "API_PORT",
  "NODE_ENV"
];

const env = Object.entries(process.env)
  .filter(([key]) => acceptedEnvVars.includes(key))
  .reduce((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});

const stringifiedEnv = {
  "process.env": Object.entries(env)
    .reduce((newEnv, [key, value]) => {
      newEnv[key] = JSON.stringify(value);
      return newEnv;
    }, {})
};

module.exports = {
  env, stringifiedEnv
};