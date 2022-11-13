import yargs from "yargs/yargs";
import { genCerts } from "../internal/gen-certs.js";

export const main = (): void => {
  void yargs()
    .command("$0", "Generate SSL certificates.", {
      domain: {
        default: ["localhost", "0.0.0.0"],
        alias: "d",
        type: "array"
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
    }, genCerts)
    .demandCommand()
    .help()
    .argv;
};
