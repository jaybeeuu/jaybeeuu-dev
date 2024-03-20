import path from "path";
import * as fs from "fs";
import { certificateFor, uninstall as baseUninstall } from "devcert";

export const uninstall = (): void => {
  console.log("Uninstalling CA...");
  baseUninstall();
  console.log("Done.");
};

export interface PathOptions {
  directory: string;
  certName: string;
  keyName: string;
  caName: string;
}

interface Paths {
  certFilePath: string;
  keyFilePath: string;
  caFilePath: string;
}

const getPaths = (options: PathOptions): Paths => {
  const resolveToOutDir = (...pathSegments: string[]): string =>
    path.resolve(process.cwd(), options.directory, ...pathSegments);

  return {
    certFilePath: resolveToOutDir(options.certName),
    keyFilePath: resolveToOutDir(options.keyName),
    caFilePath: resolveToOutDir(options.caName),
  };
};

const writePem = async (filePath: string, buffer: Buffer): Promise<void> => {
  const wholeCert = buffer.toString();
  const beginCertIndex = wholeCert.indexOf("-----BEGIN");
  const pemCert = wholeCert.slice(beginCertIndex);
  await fs.promises.writeFile(filePath, pemCert);
};

export interface GenCertsOptions extends PathOptions {
  domain: string[];
}

export const genCerts = async (options: GenCertsOptions): Promise<void> => {
  const ssl = await certificateFor(options.domain, { getCaBuffer: true });
  await fs.promises.mkdir(options.directory, { recursive: true });
  const paths = getPaths(options);
  await Promise.all([
    writePem(paths.certFilePath, ssl.cert),
    fs.promises.writeFile(paths.keyFilePath, ssl.key),
    fs.promises.writeFile(paths.caFilePath, ssl.ca),
  ]);

  console.log(
    [
      "Certificates generated at:",
      "",
      paths.caFilePath,
      paths.certFilePath,
      paths.keyFilePath,
    ].join("\n"),
  );
};
