import crypto from "crypto";

export const getHash = (data: string): string => {
  const hash = crypto.createHash("sha1");
  hash.update(data);
  return hash.digest("base64");
};
