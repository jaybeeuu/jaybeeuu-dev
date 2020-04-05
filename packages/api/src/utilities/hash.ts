import crypto from "crypto";

// Algorithm depends on availability of OpenSSL on platform
// Another algorithms: 'sha1', 'md5', 'sha256', 'sha512' ...
const algorithm = "sha1";

export const getHash = (data: string): string => {
  const hash = crypto.createHash(algorithm);
  hash.update(data);
  return hash.digest("hex");
};