import dotenv from "dotenv";

dotenv.config();

export const NODE_ENV = process.env.NODE_ENV || "development";

export const API_HOST_NAME = process.env.API_HOST_NAME || "localhost";
export const API_PORT = +(process.env.PORT || 3444);

export const CLIENT_HOST_NAME = process.env.CLIENT_HOST_NAME || "localhost";
export const CLIENT_PORT = +(process.env.CLIENT_PORT || 3443);

export const POST_REPO_DIRECTORY = process.env.POST_REPO_DIRECTORY || "./fs/watch/local";
export const POST_REPO_USER_NAME = process.env.POST_REPO_USER_NAME || "Dev Ortest";
export const POST_REPO_USER_EMAIL = process.env.POST_REPO_USER_NAME || "dev.ortest@email.com";
export const REMOTE_POST_REPO = process.env.POST_REPO_REMOTE || "./fs/watch/remote/.git";

export const POST_DIST_DIRECTORY = process.env.POST_DIST_DIRECTORY || "./fs/watch/dist";
