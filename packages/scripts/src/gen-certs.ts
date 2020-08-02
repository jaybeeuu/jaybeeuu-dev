import path from "path";
import * as fs from "fs";
import { certificateFor } from "devcert";
import getopts from "getopts";

interface ProcessOptions {
  domain: string;
  directory: string;
  certName: string;
  keyName: string;
}

const processOptions = getopts(process.argv.slice(2), {
  default: {
    domain: "localhost",
    directory: "./certs",
    certName: "cert.crt",
    keyName: "key.key",
    caName: "ca.pem"
  }
}) as unknown as ProcessOptions;

const resolveToOutDir = (...pathSegments: string[]) => path.resolve(
  process.cwd(),
  processOptions.directory,
  ...pathSegments
);

const certFilePath = resolveToOutDir(processOptions.certName);
const keyFilePath = resolveToOutDir(processOptions.keyName);
const caFilePath = resolveToOutDir(processOptions.keyName);

(async () => {
  try {
    const ssl = await certificateFor(processOptions.domain, { getCaBuffer: true });
    await fs.promises.mkdir(processOptions.directory, { recursive: true });
    await Promise.all([
      fs.promises.writeFile(certFilePath, ssl.cert),
      fs.promises.writeFile(keyFilePath, ssl.key),
      fs.promises.writeFile(caFilePath, ssl.ca)
    ]);
  } catch (err) {
    console.error(err);
  }
})();
