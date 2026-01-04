import crypto from "node:crypto";

const getSha1Hash = (data: string): string => {
  const hash = crypto.createHash("sha1", {
    encoding: "base64",
  });
  hash.update(data);
  return hash.digest("base64");
};
export interface HashOptions {
  maxLength?: number;
  allowedChars: string;
}

const defaultHashOptions: HashOptions = {
  allowedChars: "0-9A-Za-z",
};

export const getHash = (
  data: string,
  userOptions: Partial<HashOptions> = {},
): string => {
  const options = {
    ...defaultHashOptions,
    ...userOptions,
  };
  const hash = getSha1Hash(data);
  return hash
    .replace(new RegExp(`[^${options.allowedChars}]`, "g"), "")
    .substring(0, options.maxLength);
};
