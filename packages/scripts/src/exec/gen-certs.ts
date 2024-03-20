import yargs from "yargs";
import { genCerts, uninstall } from "../internal/gen-certs.js";

export const main = (argv: string[]): void => {
  void yargs(argv)
    .command(
      ["$0", "make"],
      "Generate SSL certificates.",
      {
        domain: {
          default: ["localhost"],
          alias: "d",
          type: "string",
          array: true,
        },
        directory: {
          default: "./certs",
          alias: "o",
          type: "string",
        },
        certName: {
          default: "cert.crt",
          alias: "crt",
          type: "string",
        },
        keyName: {
          default: "key.key",
          alias: "k",
          type: "string",
        },
        caName: {
          default: "ca.pem",
          alias: "ca",
          type: "string",
        },
      },
      async (args) => {
        await genCerts(args);
      },
    )
    .command("uninstall", "Uninstalls the CA.", {}, uninstall)
    .demandCommand()
    .help().argv;
};
