import dotenv from "dotenv";

dotenv.config();

const port: number = +(process.env.PORT || 3000);

export {
  port
};