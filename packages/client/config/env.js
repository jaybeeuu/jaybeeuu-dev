const dotenv = require("dotenv");

dotenv.config();

const envVars = {
  "CLIENT_HOST_NAME": "localhost",
  "CLIENT_PORT": "3443",
  "API_HOST_NAME": "localhost",
  "API_PORT": "3444",
  "NODE_ENV": "devlopment"
};

const env = {
  ...envVars,
  ...Object.entries(process.env)
    .filter(([key]) => Object.keys(envVars).includes(key))
    .reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {})
};

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