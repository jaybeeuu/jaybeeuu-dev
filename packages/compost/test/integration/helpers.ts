import path from "path";
import { readTextFile } from "../../src/files/index";
import type { PostManifest, UpdateOptions } from "../../src/posts/src/types.js";
import { update } from "../../src/posts/index.js";
import type { Result } from "../../src/results.js";
import type { UpdateFailureReason } from "packages/compost/src/posts/src/update.js";

jest.mock("fs");

export const jestWorkerId = +(process.env.JEST_WORKER_ID || 0);
const packageDir = path.resolve(__dirname, "../..");

const resolveToPackage = (...pathSegments: string[]): string => {
  return path.resolve(packageDir, ...pathSegments);
};

export const sourceDir = resolveToPackage(`.fs/test/${jestWorkerId.toString()}/src`);
export const outputDir = resolveToPackage(`.fs/test/${jestWorkerId.toString()}/out`);
export const manifestFileName = "mainfest.post.json";

const getOutputFile = async (filePath: string): Promise<string> => {
  const resolvedFilePath = path.resolve(outputDir, filePath);
  return readTextFile(resolvedFilePath);
};

export const getPostManifest = async (): Promise<PostManifest> => {
  const fileName = path.join("posts", manifestFileName);
  const fileContent = await getOutputFile(fileName);
  return JSON.parse(fileContent) as PostManifest;
};

export const getPost = (href: string): Promise<string> => {
  return getOutputFile(`.${href}`);
};

export const compilePosts = async (options?: Partial<UpdateOptions>): Promise<Result<PostManifest, UpdateFailureReason>> => {
  return update({
    hrefRoot: "posts",
    manifestFileName,
    outputDir: path.join(outputDir, "posts"),
    sourceDir,
    watch: false,
    additionalWatchPaths: [],
    includeUnpublished: false,
    ...options
  });
};
