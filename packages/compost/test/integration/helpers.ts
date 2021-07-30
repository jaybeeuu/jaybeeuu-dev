import path from "path";
import type Utilities from "@jaybeeuu/utilities";
import type { File} from "../../src/files/index";
import { writeJsonFile } from "../../src/files/index";
import { readTextFile, writeTextFiles, deleteDirectories} from "../../src/files/index";
import type { PostManifest, UpdateOptions } from "../../src/posts/src/types.js";
import { update } from "../../src/posts/index.js";
import type { Result } from "../../src/results.js";
import type { UpdateFailureReason } from "packages/compost/src/posts/src/update.js";
import type { PostMetaFileData } from "packages/compost/src/posts/src/metafile";
import { assertIsNotNullish } from "@jaybeeuu/utilities";

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

export const cleanUpDirectories = async (): Promise<void> => {
  await deleteDirectories("/");
};

export interface PostFile {
  content: string | string[];
  meta: PostMetaFileData | null;
  path?: string;
  slug: string;
  otherFiles?: {
    content: string,
    path: string
  }[]
}

const getDefaultedUpdateOptions = (
  options: Partial<UpdateOptions> = {}
): UpdateOptions => {
  const defaultedHrefRoot = options?.hrefRoot ?? "posts";
  return {
    additionalWatchPaths: [],
    hrefRoot: defaultedHrefRoot,
    includeUnpublished: false,
    manifestFileName: "manifest.post.json",
    outputDir: path.join("out", defaultedHrefRoot),
    requireOldManifest: false,
    sourceDir: "src",
    watch: false,
    ...options
  };
};

export const writeOutputManifestFile = async (
  manifest: PostManifest,
  options: Partial<UpdateOptions> = {}
): Promise<void> => {
  const defaultedUpdateOptions = getDefaultedUpdateOptions(options);
  await writeJsonFile(
    path.join(defaultedUpdateOptions.outputDir, defaultedUpdateOptions.manifestFileName),
    manifest
  );
};

export const writePostFile = async (
  postFile: PostFile,
  options: Partial<UpdateOptions> = {}
): Promise<void> => {
  const defaultedUpdateOptions = getDefaultedUpdateOptions(options);

  const {
    content,
    meta,
    path: postPath = ".",
    slug,
    otherFiles
  } = postFile;

  await writeTextFiles(
    defaultedUpdateOptions.sourceDir,
    [
      {
        path: path.join(postPath, `${slug}.md`),
        content: Array.isArray(content) ? content.join("\n") : content
      },
      meta !== null ? {
        path: path.join(postPath, `${slug}.post.json`),
        content: JSON.stringify(meta, null, 2)
      } : null,
      ...otherFiles?.map((file) => ({
        path: path.join(postPath, file.path),
        content: file.content
      })) ?? []
    ].filter((
      member: File | null
    ): member is File => {
      return member !== null;
    })
  );
};

export const getOutputFile = async (
  filePath: string,
  options: Partial<UpdateOptions> = {}
): Promise<string> => {
  const defaultedUpdateOptions = getDefaultedUpdateOptions(options);
  const resolvedFilePath = path.join(
    defaultedUpdateOptions.outputDir,
    filePath
  );
  return readTextFile(resolvedFilePath);
};

export const getPostManifest = async (
  options: Partial<UpdateOptions> = {}
): Promise<PostManifest> => {
  const defaultedUpdateOptions = getDefaultedUpdateOptions(options);
  const fileContent = await getOutputFile(
    defaultedUpdateOptions.manifestFileName,
    defaultedUpdateOptions
  );
  return JSON.parse(fileContent) as PostManifest;
};

export const getPost = async (
  slug: string,
  options: Partial<UpdateOptions> = {}
): Promise<string> => {
  const manifest = await getPostManifest(options);
  const defaultedUpdateOptions = getDefaultedUpdateOptions(options);
  const manifestEntry = manifest[slug];
  assertIsNotNullish(manifestEntry);

  const relativePath = path.relative(defaultedUpdateOptions.hrefRoot, `.${manifestEntry.href}`);

  return await getOutputFile(relativePath, options);
};

export const compilePosts = async (options?: Partial<UpdateOptions>): Promise<Result<PostManifest, UpdateFailureReason>> => {
  const defaultedUpdateOptions = getDefaultedUpdateOptions(options);
  return update(defaultedUpdateOptions);
};

export const getCompiledPostWithContent = async (
  contentOrPost: string[] | RecursivePartial<PostFile>,
  options: Partial<UpdateOptions> = {}
): Promise<string> => {
  await cleanUpDirectories();
  const userPost = Array.isArray(contentOrPost)
    ? { content: contentOrPost }
    : contentOrPost;
  const postFile = {
    slug: "{slug}",
    content: ["{content}"],
    ...userPost,
    meta: {
      abstract: "{abstract}",
      publish: true,
      title: "{title}",
      ...userPost.meta
    }
  };

  await writePostFile(postFile, options);
  const result = await compilePosts(options);
  if (!result.success) {
    throw result;
  }
  return await getPost(postFile.slug, options);
};
