const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  PORT: +(process.env.PORT || 3443),
  HOST: process.env.HOST || "0.0.0.0",
  NODE_ENV: process.env.NODE_ENV || "development"
};
