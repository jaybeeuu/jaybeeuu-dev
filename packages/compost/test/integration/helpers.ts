import path from "path";
import type Utilities from "@jaybeeuu/utilities";
import type { File } from "../../src/files/index";
import { readTextFile, writeTextFiles , deleteDirectories} from "../../src/files/index";
import type { PostManifest, UpdateOptions } from "../../src/posts/src/types.js";
import { update } from "../../src/posts/index.js";
import type { Result } from "../../src/results.js";
import type { UpdateFailureReason } from "packages/compost/src/posts/src/update.js";
import type { PostMetaFileData } from "packages/compost/src/posts/src/metafile";

jest.mock("fs");
jest.mock("@jaybeeuu/utilities", () => {
  const utils = jest.requireActual<typeof Utilities>("@jaybeeuu/utilities");
  utils.log = {
    error: jest.fn(),
    getErrorMessage: jest.fn(),
    info: jest.fn(),
    warn: jest.fn()
  };
  return utils;
});

export const jestWorkerId = +(process.env.JEST_WORKER_ID || 0);
const packageDir = path.resolve(__dirname, "../..");

const resolveToPackage = (...pathSegments: string[]): string => {
  return path.resolve(packageDir, ...pathSegments);
};

export const sourceDir = resolveToPackage(`.fs/test/${jestWorkerId.toString()}/src`);
export const outputDir = resolveToPackage(`.fs/test/${jestWorkerId.toString()}/out`);
export const manifestFileName = "mainfest.post.json";

export const cleanUpDirectories = async (): Promise<void> => {
  await deleteDirectories(sourceDir, outputDir);
};

export interface PostFile {
  content: string | string[];
  meta: PostMetaFileData | null;
  path?: string;
  slug: string;
}

export const writePostFiles = async (
  ...postFiles: PostFile[]
): Promise<void> => {
  await Promise.all(postFiles.map(async ({
    content,
    meta,
    path: filePath = ".",
    slug
  }) => await writeTextFiles(
    sourceDir,
    [
      {
        path: path.join(filePath, `${slug}.md`),
        content: Array.isArray(content) ? content.join("\n") : content
      },
      meta !== null ? {
        path: path.join(filePath, `${slug}.post.json`),
        content: JSON.stringify(meta, null, 2)
      } : null
    ].filter((
      member: File | null
    ): member is File => {
      return member !== null;
    })
  )));
};

const getOutputFile = async (filePath: string): Promise<string> => {
  const resolvedFilePath = path.resolve(outputDir, filePath);
  return readTextFile(resolvedFilePath);
};

export const getPostManifest = async (): Promise<PostManifest> => {
  const fileName = path.join("posts", manifestFileName);
  const fileContent = await getOutputFile(fileName);
  return JSON.parse(fileContent) as PostManifest;
};

export const getPost = async (slug: string): Promise<string> => {
  const manifest = await getPostManifest();
  return await getOutputFile(`.${manifest[slug]?.href}`);
};

export const compilePosts = async (options?: Partial<UpdateOptions>): Promise<Result<PostManifest, UpdateFailureReason>> => {
  return update({
    additionalWatchPaths: [],
    hrefRoot: "posts",
    includeUnpublished: false,
    manifestFileName,
    outputDir: path.join(outputDir, "posts"),
    requireOldManifest: false,
    sourceDir,
    watch: false,
    ...options
  });
};

export const getCompiledPostWithContent = async (
  contentLines: string[],
  options: RecursivePartial<{
    slug: string
    updateOptions: UpdateOptions
  }> = {}
): Promise<string> => {
  const { slug = "{slug}", updateOptions } = options;
  await cleanUpDirectories();
  await writePostFiles({
    slug,
    content: contentLines,
    meta: {
      abstract: "abstract",
      publish: true,
      title: "{title}"
    }
  });
  await compilePosts(updateOptions);
  return await getPost(slug);
};
