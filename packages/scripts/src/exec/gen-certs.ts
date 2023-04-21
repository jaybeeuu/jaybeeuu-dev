import yargs from "yargs";

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
          array: true
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
      },
      async (args) => {
        const { genCerts } = await import("../internal/gen-certs.js");
        await genCerts(args);
      }
    )
    .command(
      "uninstall",
      "Uninstalls the CA.",
      {},
      async () => {
        const { uninstall } = await import("../internal/gen-certs.js");
        uninstall();
      }
    )
    .demandCommand()
    .help()
    .argv;
};
