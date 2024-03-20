import crypto from "crypto";

const getSha1Hash = (data: string): string => {
  const hash = crypto.createHash("sha1");
  hash.update(data);
  return hash.digest("base64");
};

export interface HashOptions {
  length: number;
  allowedChars: string;
}

const defaultHashOptions: HashOptions = {
  length: 6,
  allowedChars: "0-9A-z",
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
    .substring(0, options.length);
};
