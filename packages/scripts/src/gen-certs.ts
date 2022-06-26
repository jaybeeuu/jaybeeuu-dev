import yargs from "yargs/yargs";
import path from "path";
import * as fs from "fs";
import { certificateFor } from "devcert";

interface PathOptions {
  directory: string;
  certName: string;
  keyName: string;
  caName: string;
}

interface RunOptions extends PathOptions {
  domain: string;
}

interface Paths {
  certFilePath: string;
  keyFilePath: string;
  caFilePath: string;
}

const getPaths = (options: PathOptions): Paths => {
  const resolveToOutDir = (...pathSegments: string[]): string => path.resolve(
    process.cwd(),
    options.directory,
    ...pathSegments
  );

  return {
    certFilePath: resolveToOutDir(options.certName),
    keyFilePath: resolveToOutDir(options.keyName),
    caFilePath: resolveToOutDir(options.caName)
  };
};

const writePem = async (filePath: string, buffer: Buffer): Promise<void> => {
  const wholeCert = buffer.toString();
  const beginCertIndex = wholeCert.indexOf("-----BEGIN");
  const pemCert = wholeCert.slice(beginCertIndex);
  await fs.promises.writeFile(filePath, pemCert);
};

const run = async (options: RunOptions): Promise<void> => {
  const ssl = await certificateFor(options.domain, { getCaBuffer: true });
  await fs.promises.mkdir(options.directory, { recursive: true });
  const paths = getPaths(options);
  await Promise.all([
    writePem(paths.certFilePath, ssl.cert),
    fs.promises.writeFile(paths.keyFilePath, ssl.key),
    fs.promises.writeFile(paths.caFilePath, ssl.ca)
  ]);

  console.log([
    "Certificates generated at:",
    "",
    paths.caFilePath,
    paths.certFilePath,
    paths.keyFilePath
  ].join("\n"));
};

export const main = (): void => {
  void yargs()
    .command("$0", "Generate SSL certificates.", {
      domain: {
        default: "localhost",
        alias: "d",
        type: "string"
      },
      directory: {
        default: "./certs",
        alias: "o",
        type: "string"
      },
      certName: {
        default: "cert.crt",
        alias: "crt",
        type: "string"
      },
      keyName: {
        default: "key.key",
        alias: "k",
        type: "string"
      },
      caName: {
        default: "ca.pem",
        alias: "ca",
        type: "string"
      }
    }, async (options) => {
      try {
        await run(options);
      } catch (err) {
        console.error(err);
        process.exit(1);
      }
    })
    .demandCommand()
    .help()
    .argv;
};
