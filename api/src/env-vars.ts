import dotenv from "dotenv";

dotenv.config();

export const httpPort: number = +(process.env.PORT || 3000);
export const httpsPort: number = +(process.env.PORT || 3443);
