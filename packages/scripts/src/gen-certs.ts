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
    keyName: "key.key"
  }
}) as unknown as ProcessOptions;

const certFilePath = path.resolve(process.cwd(), processOptions.directory, processOptions.certName);
const keyFilePath = path.resolve(process.cwd(), processOptions.directory, processOptions.keyName);

(async () => {
  try {
    const ssl = await certificateFor(processOptions.domain, {  getCaPath: true });
    console.log(`CA Path: ${ssl.caPath}`);
    await fs.promises.mkdir(processOptions.directory, { recursive: true });
    await Promise.all([
      fs.promises.writeFile(certFilePath, ssl.cert),
      fs.promises.writeFile(keyFilePath, ssl.key)
    ]);
  } catch (err) {
    console.error(err);
  }
})();
