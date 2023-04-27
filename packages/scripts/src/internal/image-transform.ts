import fastGlob from "fast-glob";
import path from "node:path";
import type { OutputInfo } from "sharp";
import sharp from "sharp";

export type OutFileSize = { height: number; width: number; } | { height: number; } | { width: number; };

export interface OutFile {
  fileName: string;
  blur?: number;
  size?: OutFileSize;
}

export interface ImageTransformOptions {
  clean: boolean;
  outDir: string;
  source: string;
  outFiles: OutFile[];
}

const resolveCwd = (...paths: string[]): string => path.resolve(process.cwd(), ...paths);

const getFileName = (filePath: string): string => {
  const baseName = path.basename(filePath);
  return baseName.split(".")[0] ?? baseName;
};

const processFile = (filePath: string, outDir: string, outFiles: OutFile[]): Promise<OutputInfo>[] => {
  console.log("Transforming", filePath);
  const fileName = getFileName(filePath);

  return outFiles.map((outFile) => {
    const image = sharp(filePath);
    const blurred = outFile.blur ? image.blur(outFile.blur) : image;
    const resized = outFile.size ? blurred.resize(outFile.size) : blurred;
    const fileOut = resolveCwd(path.join(outDir, outFile.fileName.replace("{}", fileName)));
    console.log("  Writing to", fileOut);
    return resized.toFile(fileOut);
  });
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
  await Promise.all(
    filePaths.flatMap((filePath) => processFile(
      filePath,
      options.outDir,
      options.outFiles
    ))
  );
};
