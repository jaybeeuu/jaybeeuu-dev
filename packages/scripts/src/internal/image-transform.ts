import fastGlob from "fast-glob";
import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

export type TransformSize = { height: number; width: number; } | { height: number; } | { width: number; };

export interface Transform {
  fileName: string;
  blur?: number;
  size?: TransformSize;
  variableName?: string;
}

export interface ImageTransformOptions {
  outDir: string;
  source: string;
  transforms: Transform[];
  writeTs: boolean;
}

const resolveCwd = (...paths: string[]): string => path.resolve(process.cwd(), ...paths);

const getFileNameFromBaseName = (baseName: string): string => {
  return baseName.split(".")[0] ?? baseName;
};

const getFileNameFromPath = (filePath: string): string => {
  const baseName = path.basename(filePath);
  return getFileNameFromBaseName(baseName);
};

type PascalCase<Kebab extends string> = Kebab extends `${infer First}-${infer Rest}`
  ? `${First}${PascalCase<Capitalize<Rest>>}`
  : Kebab;

const kebabToPascalCase = <Kebab extends string>(
  kebab: Kebab
): PascalCase<Kebab> => {
  const [first, ...rest] = kebab.split("-");
  return `${
    first ?? ""
  }${
    rest.flatMap(([firstChar, ...word]) => [firstChar?.toUpperCase(), ...word]).join("")
  }` as PascalCase<Kebab>;
};

const writeTypeScriptFile = async (
  outDir: string,
  imageName: string,
  transformedNames: { fileName: string; variableName: string; }[]
): Promise<void> => {
  const fileContent = [
    "// This is an auto-generated file. Do not edit manually",
    ...transformedNames.map(({ variableName, fileName }) => {
      return `import ${variableName} from "./${fileName}";`;
    }),
    "",
    "export {",
    transformedNames.map(({ variableName }) => {
      return `  ${variableName}`;
    }).join(",\n"),
    "};",
    ""
  ].join("\n");

  const tsFileName = resolveCwd(outDir, `${imageName}.ts`);
  console.log("  Writing to", tsFileName);
  await fs.promises.writeFile(
    tsFileName,
    fileContent,
    "utf8"
  );
  console.log("  Written to", tsFileName);
};

const processFile = ({
  filePath,
  outDir,
  transforms,
  writeTs
}: { filePath: string; } & ImageTransformOptions): Promise<void>[] => {
  console.log("Transforming", filePath);
  const fileName = getFileNameFromPath(filePath);

  const transformers = transforms.map((transform) => {
    const image = sharp(filePath);
    const blurred = transform.blur ? image.blur(transform.blur) : image;
    const resized = transform.size ? blurred.resize(transform.size) : blurred;
    const transformFileName = transform.fileName.replace("{}", fileName);
    const outFilePath = resolveCwd(outDir, transformFileName);

    return {
      fileName: transformFileName,
      variableName: transform.variableName ?? kebabToPascalCase(fileName),
      write: async (): Promise<void> => {
        console.log("  Writing to", transformFileName);
        const outFileInfo = await resized.toFile(outFilePath);
        console.log(`  Written to ${transformFileName}, ${outFileInfo.size}`);
      }
    };
  });

  return {
    ...writeTs
      ? [writeTypeScriptFile(
        outDir,
        fileName,
        transformers
      )]
      : [],
    ...transformers.map((transformer) => transformer.write())
  };
};

export const imageTransform = async (options: ImageTransformOptions): Promise<void> => {
  console.log(
    "Image Transform\n",
    options
  );
  const searchPath = options.source;
  console.log(`Searching ${searchPath}`);
  const filePaths = await fastGlob(searchPath);
  console.log(`Found ${filePaths.length} files.`);
  await fs.promises.mkdir(options.outDir, { recursive: true });
  await Promise.all(
    filePaths.flatMap((filePath) => processFile({ filePath, ...options }))
  );
};
