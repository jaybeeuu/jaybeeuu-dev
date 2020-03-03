
const dotenv = require("dotenv");

dotenv.config();

const env = {
  CLIENT_HOST_NAME: process.env.CLIENT_HOST_NAME || "localhost",
  CLIENT_PORT: +(process.env.CLIENT_PORT || 3443),
  API_HOST_NAME: process.env.API_HOST_NAME || "localhost",
  API_PORT: +(process.env.PORT || 3444),
  NODE_ENV: process.env.NODE_ENV || "development"
};

const stringifiedEnv = {
  "process.env": Object.entries(env).reduce((newEnv, [key, value]) => {
    newEnv[key] = JSON.stringify(value);
    return newEnv;
  }, {})
};

module.exports = {
  env, stringifiedEnv
};