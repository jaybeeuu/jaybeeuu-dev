import yargs from "yargs";
import type { TypeAssertion} from "@jaybeeuu/utilities";
import { assert, is, isObject, optional, or } from "@jaybeeuu/utilities";
import type { OutFile } from "../internal/image-transform.js";

const assetIsOutFile: TypeAssertion<OutFile> = assert(isObject<OutFile>({
  blur: optional(is("number")),
  fileName: is("string"),
  size: optional(or(
    isObject<{ height: number; width: number; }>({
      height: is("number"),
      width: is("number")
    }),
    or(
      isObject<{ height: number; }>({
        height: is("number")
      }),
      isObject<{ width: number; }>({
        width: is("number")
      })
    )
  ))
}), "OutFile");

const parsedOutFile = (stingOrArray: string | string[]): OutFile[] => {
  const outFilesJson = Array.isArray(stingOrArray) ? stingOrArray : [stingOrArray];
  return outFilesJson.map((outFileJson) => {
    console.log(`\noutfile: ${outFileJson}\n`);
    const parsed = JSON.parse(outFileJson) as unknown;
    assetIsOutFile(parsed);
    return parsed;
  });
};

export const main = (argv: string[]): void => {
  void yargs(argv)
    .command(
      ["$0", "image-transform"],
      "Blur the images ready for a progressive image load experience.",
      {
        "out-dir": {
          description: "The directory where the output images will be written.",
          default: "./out",
          alias: ["o", "outDir"],
          type: "string"
        },
        source: {
          description: "The source glob used to find he images.",
          default: ".",
          alias: ["s"],
          type: "string"
        },
        clean: {
          description: "When set to true the out dir is cleaned before the images are written.",
          default: false,
          alias: "c",
          type: "boolean"
        },
        "out-file": {
          description: "The output image output.",
          default: "{ \"fileName\": \"{name}-blurred.webp\", \"blur\": 109 }",
          alias: ["outFile"],
          type: "string",
          array: true
        }
      },
      async (args) => {
        const { imageTransform } = await import("../internal/image-transform.js");
        const outFiles= parsedOutFile(args.outFile);
        console.log(args, imageTransform, outFiles);
        await imageTransform({
          ...args,
          outFiles
        });
      }
    )
    .demandCommand()
    .help()
    .argv;
};
