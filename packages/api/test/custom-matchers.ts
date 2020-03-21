
import { matcherHint, printExpected, printReceived } from "jest-matcher-utils";
import fs from "fs";
import crypto from "crypto";

// Algorithm depends on availability of OpenSSL on platform
// Another algorithms: 'sha1', 'md5', 'sha256', 'sha512' ...
const algorithm = "sha1";
const hash = crypto.createHash(algorithm);

const getFileHash = (filename: string): Promise<string> => {
  return new Promise((resolve) => {
    const stream = fs.createReadStream(filename);
    stream.on("data", (data) => {
      hash.update(data);
    });

    stream.on("end", () => {
      resolve(hash.digest("hex"));
    });
  });
};

expect.extend({
  toMatchDirectory(
    leftDirectory: string,
    rightDirectory: string
  ): {
    message: () => string;
    pass: boolean;
  } {
    const leftFiles =
    const rightFiles =

    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
