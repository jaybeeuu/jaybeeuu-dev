// When changing this list of variables also update accepted vars in ../config/env.js
declare const process: {
  env: { [key: string]: string | undefined }
};

export const CLIENT_HOST_NAME = process.env.CLIENT_HOST_NAME || "localhost";
export const CLIENT_PORT = +(process.env.CLIENT_PORT || 3443);
export const NODE_ENV = process.env.NODE_ENV || "development";
