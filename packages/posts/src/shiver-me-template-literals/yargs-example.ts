import yargs from "yargs/yargs";

const { howDoYeHail } = await yargs(process.argv.slice(2))
  .option("how-do-ye-hail", {
    alias: "h",
    demandOption: true,
    describe: "What should I call you?",
    type: "string"
  })
  .help()
  .parse();

console.log(
  `Avast there! Welcome ${howDoYeHail}`
);
