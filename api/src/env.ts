import dotenv from "dotenv";

dotenv.config();

export default {
  API_HOST_NAME: process.env.API_HOST_NAME || "localhost",
  API_PORT: +(process.env.PORT || 3444),
  CLIENT_HOST_NAME: process.env.CLIENT_HOST_NAME || "localhost",
  CLIENT_PORT: +(process.env.CLIENT_PORT || 3443),
  NODE_ENV: process.env.NODE_ENV || "development"
};
