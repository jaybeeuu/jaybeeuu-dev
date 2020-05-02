import dotenv from "dotenv";

dotenv.config();

export const NODE_ENV = process.env.NODE_ENV || "development";

export const API_HOST_NAME = process.env.API_HOST_NAME || "127.0.0.1";
export const API_PORT = +(process.env.PORT || 3444);

export const CLIENT_HOST_NAME = process.env.CLIENT_HOST_NAME || "127.0.0.1";
export const CLIENT_PORT = +(process.env.CLIENT_PORT || 3443);

export const POST_REPO_USER_NAME = process.env.POST_REPO_USER_NAME || "Dev Ortest";
export const POST_REPO_USER_EMAIL = process.env.POST_REPO_USER_NAME || "dev.ortest@email.com";

export const FILES_ROOT = process.env.FILES_ROOT || "./fs/watch";

export const REMOTE_POST_REPO = process.env.POST_REPO_REMOTE || "./fs/remote/watch/.git";
