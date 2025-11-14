import type Utilities from "@jaybeeuu/utilities";
import type { Result } from "@jaybeeuu/utilities";
import { assertIsNotNullish, success, failure } from "@jaybeeuu/utilities";
import { jest } from "@jest/globals";
import type {
  PostManifest,
  PostInputMetadata,
  PostManifestEntry,
} from "../../src/content/index.js";
import { contentResolverConfig } from "../../src/content/index.js";
import path from "path";
import type * as ReadingTime from "reading-time";
import { processContent } from "../../src/content/index.js";
import type { UpdateOptions } from "../../src/exec/compost.js";
import type { File } from "../../src/files/index";
import {
  deleteDirectories,
  readJsonFile,
  readTextFile,
  writeJsonFile,
  writeTextFiles,
} from "../../src/files/index";

jest.mock<typeof ReadingTime>("reading-time", (): typeof ReadingTime => {
  const readingTime = jest.requireActual<typeof ReadingTime>("reading-time");

  return {
    // @ts-expect-error __esModule tesll jes what to do, but is not included in the ReadingTime type.
    __esModule: true,
    ...readingTime,
    default: jest.fn<typeof ReadingTime.default>().mockReturnValue({
      text: "1 min read.",
      time: 1,
      words: 1,
      minutes: 1,
    }),
  };
});

jest.mock("fs");
jest.mock<typeof Utilities>("@jaybeeuu/utilities", () => {
  const utils = jest.requireActual<typeof Utilities>("@jaybeeuu/utilities");
  utils.log = {
    error: jest.fn(),
    getErrorMessage: jest.fn<(err: unknown) => string>(),
    info: jest.fn(),
    warn: jest.fn(),
  };
  return utils;
});

export const cleanUpDirectories = async (): Promise<void> => {
  await deleteDirectories("/");
};

interface BasePostFile {
  content: string | string[];
  meta: PostInputMetadata | null;
  path?: string;
  slug: string;
  otherFiles?: {
    content: string;
    path: string;
  }[];
}

interface PostFileWithFrontmatter extends BasePostFile {
  metadataStyle: "frontmatter";
}

interface PostFileWithJson extends BasePostFile {
  metadataStyle?: "json";
}

export type PostFile = PostFileWithFrontmatter | PostFileWithJson;

const getDefaultedUpdateOptions = (
  options: Partial<UpdateOptions> = {},
): UpdateOptions => {
  const defaultedHrefRoot = options.hrefRoot ?? "posts";
  return {
    additionalWatchPaths: [],
    codeLineNumbers: false,
    hrefRoot: defaultedHrefRoot,
    includeUnpublished: false,
    manifestFileName: "post-manifest.json",
    oldManifestLocators: [],
    outputDir: path.join("out", defaultedHrefRoot),
    removeH1: false,
    requireOldManifest: false,
    sourceDir: "src",
    watch: false,
    clean: true,
    ...options,
  };
};

export const writeOutputManifestFile = async (
  manifest: PostManifest,
  options: Partial<UpdateOptions> = {},
): Promise<void> => {
  const defaultedUpdateOptions = getDefaultedUpdateOptions(options);
  await writeJsonFile(
    path.join(
      defaultedUpdateOptions.outputDir,
      defaultedUpdateOptions.manifestFileName,
    ),
    manifest,
  );
};

const getMarkdownContent = (
  content: string | string[],
  meta: PostInputMetadata | null,
): string => {
  const markdownContent = Array.isArray(content) ? content.join("\n") : content;

  const frontMatter =
    meta === null
      ? ""
      : [
          "---",
          ...Object.entries(meta).map(([key, value]) => {
            if (typeof value === "string") {
              return `${key}: "${value}"`;
            }
            return `${key}: ${value}`;
          }),
          "---",
        ].join("\n");
  return `${frontMatter}\n${markdownContent}`;
};

const writeFrontmatterPost = (
  postFile: PostFileWithFrontmatter,
  postPath: string,
): File[] => {
  const { content, meta, slug } = postFile;

  return [
    {
      path: path.join(postPath, `${slug}.post.md`),
      content: getMarkdownContent(content, meta),
    },
  ];
};

const writeJsonPost = (
  postFile: PostFileWithJson,
  postPath: string,
): File[] => {
  const { content, meta, slug } = postFile;

  const markdownContent = Array.isArray(content) ? content.join("\n") : content;

  const files: File[] = [
    {
      path: path.join(postPath, `${slug}.md`),
      content: markdownContent,
    },
  ];

  if (meta !== null) {
    files.push({
      path: path.join(postPath, `${slug}.post.json`),
      content: JSON.stringify(meta, null, 2),
    });
  }

  return files;
};

export const writePostFile = async (
  postFile: PostFile,
  options: Partial<UpdateOptions> = {},
): Promise<void> => {
  const defaultedUpdateOptions = getDefaultedUpdateOptions(options);

  const { path: postPath = ".", otherFiles } = postFile;

  const strategyFiles: File[] =
    postFile.metadataStyle === "frontmatter"
      ? writeFrontmatterPost(postFile, postPath)
      : writeJsonPost(postFile, postPath);

  const allFiles = [
    ...strategyFiles,
    ...(otherFiles?.map((file) => ({
      path: path.join(postPath, file.path),
      content: file.content,
    })) ?? []),
  ];

  await writeTextFiles(defaultedUpdateOptions.sourceDir, allFiles);
};

export const getOutputFile = async (
  filePath: string,
  options: Partial<UpdateOptions> = {},
): Promise<string> => {
  const defaultedUpdateOptions = getDefaultedUpdateOptions(options);
  const resolvedFilePath = path.join(
    defaultedUpdateOptions.outputDir,
    filePath,
  );

  return readTextFile(resolvedFilePath);
};

export const getPostManifest = async (
  options: Partial<UpdateOptions> = {},
): Promise<PostManifest> => {
  const defaultedUpdateOptions = getDefaultedUpdateOptions(options);

  // With the new orchestrator, post manifests are in post-manifest.json
  const fileContent = await getOutputFile(
    "post-manifest.json",
    defaultedUpdateOptions,
  );
  const parsedContent = JSON.parse(fileContent);

  // Handle both versioned (v2+) and legacy (v1) manifest formats
  if (
    typeof parsedContent === "object" &&
    parsedContent !== null &&
    "version" in parsedContent &&
    "entries" in parsedContent
  ) {
    // New versioned format - return the full manifest structure
    return parsedContent as PostManifest;
  } else {
    // Legacy format - wrap in V2 structure for consistency
    return {
      version: 1,
      metadata: {
        generatedAt: new Date().toISOString(),
        entryCount: Object.keys(parsedContent || {}).length,
        overallHash: "legacy",
      },
      entries: parsedContent || {},
    } as PostManifest;
  }
};

export const getPost = async (
  slug: string,
  options: Partial<UpdateOptions> = {},
): Promise<string> => {
  const manifest = await getPostManifest(options);
  const defaultedUpdateOptions = getDefaultedUpdateOptions(options);
  const manifestEntry = manifest.entries[slug];
  assertIsNotNullish(manifestEntry);

  const relativePath = path.relative(
    defaultedUpdateOptions.hrefRoot,
    `.${manifestEntry.href}`,
  );

  return await getOutputFile(relativePath, options);
};

export const compilePosts = async (
  options?: Partial<UpdateOptions>,
): Promise<Result<PostManifest, string>> => {
  const defaultedUpdateOptions = getDefaultedUpdateOptions(options);
  // Convert to new orchestrator config
  const orchestratorConfig = { clean: defaultedUpdateOptions.clean };

  // Create content config overrides for posts based on legacy options
  const contentConfigOverrides = {
    post: {
      ...contentResolverConfig.post,
      sourceDir: defaultedUpdateOptions.sourceDir,
      outputDir: defaultedUpdateOptions.outputDir,
      hrefRoot: defaultedUpdateOptions.hrefRoot,
      includeUnpublished: defaultedUpdateOptions.includeUnpublished,
      codeLineNumbers: defaultedUpdateOptions.codeLineNumbers,
      removeH1: defaultedUpdateOptions.removeH1,
      manifestFileName: defaultedUpdateOptions.manifestFileName,
      oldManifestLocators: defaultedUpdateOptions.oldManifestLocators,
      requireOldManifest: defaultedUpdateOptions.requireOldManifest,
    } as any,
  };

  const updateResult = await processContent(
    orchestratorConfig,
    contentConfigOverrides,
  );
  if (!updateResult.success) {
    return updateResult;
  }

  // Extract post manifest from the result
  const postManifest = updateResult.value.post;
  if (!postManifest) {
    return failure("post processing failed", "No post manifest generated");
  }

  return success(postManifest as PostManifest);
};

export const getCompiledPostWithContent = async (
  contentOrPost: string[] | RecursivePartial<PostFile>,
  options: Partial<UpdateOptions> = {},
): Promise<string> => {
  await cleanUpDirectories();

  const userPost = Array.isArray(contentOrPost)
    ? { content: contentOrPost }
    : contentOrPost;

  const defaultedUpdateOptions = getDefaultedUpdateOptions(options);
  const postFile = {
    slug: "test-slug",
    content: ["{content}"],
    path: defaultedUpdateOptions.sourceDir,
    ...userPost,
    meta: {
      abstract: "{abstract}",
      publish: true,
      title: "{title}",
      ...userPost.meta,
    },
  };

  await writePostFile(postFile, options);
  const result = await compilePosts(options);
  if (!result.success) {
    throw result;
  }
  return await getPost(postFile.slug, options);
};
