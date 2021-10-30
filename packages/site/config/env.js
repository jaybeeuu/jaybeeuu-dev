const dotenv = require("dotenv");

dotenv.config();

const envVars = {
  "CLIENT_HOST_NAME": "0.0.0.0",
  "CLIENT_PORT": "3443",
  "NODE_ENV": "development"
};

process.env.NODE_ENV = process.env.NODE_ENV ?? envVars.NODE_ENV;

const env = {
  ...envVars,
  ...Object.fromEntries(
    Object.entries(process.env)
      .filter(([key]) => Object.keys(envVars).includes(key))
  )
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