import yargs from "yargs";
import type { TypeAssertion} from "@jaybeeuu/utilities";
import { assert, is, isObject, optional, or } from "@jaybeeuu/utilities";
import type { Transform } from "../internal/image-transform.js";

const assetIsTransform: TypeAssertion<Transform> = assert(isObject<Transform>({
  blur: optional(is("number")),
  variableName: optional(is("string")),
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

const parsedTransforms = (stingOrArray: string | string[]): Transform[] => {
  const transformsJson = Array.isArray(stingOrArray) ? stingOrArray : [stingOrArray];
  return transformsJson.map((transformJson) => {
    try {
      console.log(`\transform: ${transformJson}\n`);
      const parsed = JSON.parse(transformJson) as unknown;
      assetIsTransform(parsed);
      return parsed;
    } catch (error) {
      throw new Error(
        `Error while parsing transform: ${String(error)} \n${transformJson}`
      );
    }
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
        "transform": {
          description: "The transforms applied to each image.",
          default: "{ \"fileName\": \"{name}-blurred.webp\", \"blur\": 109 }",
          alias: ["outFile"],
          type: "string",
          array: true
        },
        writeTs: {
          description: "When set TypeScript files are written, which export the transforms of each image.",
          default: false,
          alias: "w",
          type: "boolean"
        }
      },
      async (args) => {
        const { imageTransform } = await import("../internal/image-transform.js");
        const transforms = parsedTransforms(args.transform);
        await imageTransform({
          ...args,
          transforms
        });
      }
    )
    .demandCommand()
    .help()
    .argv;
};
