import path from "path";
import type Utilities from "@jaybeeuu/utilities";
import type { File } from "../../src/files/index";
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
}

export const writePostFile = async (
  postFile: PostFile,
  options: Partial<UpdateOptions> = {}
): Promise<void> => {
  const defaultedUpdateOptions = getDefaultedUpdateOptions(options);

  const {
    content,
    meta,
    path: filePath = ".",
    slug
  } = postFile;

  await writeTextFiles(
    defaultedUpdateOptions.sourceDir,
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
  );
};

const writePostFiles = async (
  postFiles: PostFile[],
  options: Partial<UpdateOptions> = {}
): Promise<void> => {
  await Promise.all(postFiles.map(
    (postFile) => writePostFile(postFile, options)
  ));
};

const getOutputFile = async (
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

export const compilePosts = async (options?: Partial<UpdateOptions>): Promise<Result<PostManifest, UpdateFailureReason>> => {
  const defaultedUpdateOptions = getDefaultedUpdateOptions(options);
  return update(defaultedUpdateOptions);
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
  await writePostFiles([{
    slug,
    content: contentLines,
    meta: {
      abstract: "abstract",
      publish: true,
      title: "{title}"
    }
  }]);
  const defaultedUpdateOptions = getDefaultedUpdateOptions(updateOptions);
  await compilePosts(defaultedUpdateOptions);
  return await getPost(slug, defaultedUpdateOptions);
};
