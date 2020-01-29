import dotenv from "dotenv";

dotenv.config();

export const httpsPort: number = +(process.env.PORT || 3443);
