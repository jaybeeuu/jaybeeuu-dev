import type utilities from "@jaybeeuu/utilities";
import type { Result } from "@jaybeeuu/utilities";
import { assertIsNotNullish, success } from "@jaybeeuu/utilities";
import { jest } from "@jest/globals";
import path from "node:path";
import { processContent } from "../../src/content/index.js";
import type { UpdateOptions } from "../../src/exec/compost.js";
import type { File } from "../../src/files/index";
import {
  deleteDirectories,
  readTextFile,
  writeJsonFile,
  writeTextFiles,
} from "../../src/files/index";
import type { BaseOutputMeta } from "../../src/content/services/manifest/manifest-operations.js";
import type { Manifest } from "../../src/content/services/manifest/manifest-operations.js";
import { isManifest } from "../../src/content/services/manifest/manifest-operations.js";
import { is, isObject } from "@jaybeeuu/is";
import type { CheckedBy } from "@jaybeeuu/is";
import type { ContentTypeDefinition } from "../../src/content/content-types.js";
import getReadingTime from "reading-time";
import { getCompiledPostFileName } from "../../src/content/file-paths.js";

jest.mock("reading-time", () => {
  return jest.fn().mockReturnValue({
    text: "1 min read.",
    time: 1,
    words: 1,
    minutes: 1,
  });
});

jest.mock("node:fs");
jest.mock<typeof utilities>("@jaybeeuu/utilities", () => {
  const utils = jest.requireActual<typeof utilities>("@jaybeeuu/utilities");
  utils.log = {
    error: jest.fn(),
    getErrorMessage: jest.fn<(err: unknown) => string>(),
    info: jest.fn(),
    warn: jest.fn(),
  };
  return utils;
});

// Test content type definitions - isolated from real configuration
export const isTestPostInputMetadata = isObject({
  title: is("string"),
  abstract: is("string"),
  publish: is("boolean"),
} as const);
export type TestPostInputMetadata = CheckedBy<typeof isTestPostInputMetadata>;

export const isTestReadingTime = isObject({
  text: is("string"),
  time: is("number"),
  words: is("number"),
  minutes: is("number"),
});
export type TestReadingTime = CheckedBy<typeof isTestReadingTime>;

export const isTestPostOutputMetadata = isObject({
  title: is("string"),
  abstract: is("string"),
  readingTime: isTestReadingTime,
});
export type TestPostOutputMetadata = CheckedBy<typeof isTestPostOutputMetadata>;

export type TestPostManifestEntry = BaseOutputMeta & TestPostOutputMetadata;

export type TestPostManifest = Manifest<TestPostOutputMetadata>;

export const isTestPostManifest = isManifest<TestPostOutputMetadata>(
  isTestPostOutputMetadata,
);

export const testPostContentTypeDefinition = {
  contentType: "post",
  filePatterns: {
    frontmatter: [".post.md"],
    jsonMetadata: [".md"],
    jsonSuffix: ".post.json",
  },
  generateSlug: (filePath: string, sourceDir: string) => {
    const relativePath = path.relative(sourceDir, filePath);
    return path
      .basename(relativePath, path.extname(relativePath))
      .replace(/\.post$/, "");
  },
  generateFileName: (slug: string, html: string) => {
    return getCompiledPostFileName(slug, html);
  },
  validateInputMeta: (data: unknown): data is TestPostInputMetadata => {
    return isTestPostInputMetadata(data);
  },
  mapToOutputMeta: (input: TestPostInputMetadata, content: string) => {
    const readingTime = getReadingTime(content);
    return {
      title: input.title,
      abstract: input.abstract,
      readingTime,
    };
  },
  sourceDir: "src",
  outputDir: "out",
  hrefRoot: "/",
  includeUnpublished: false,
  codeLineNumbers: false,
  removeH1: false,
} satisfies ContentTypeDefinition<
  "post",
  TestPostInputMetadata,
  TestPostOutputMetadata
>;

export const testContentTypeDefinitions = {
  post: testPostContentTypeDefinition,
} as const;

export const cleanUpDirectories = async (): Promise<void> => {
  // Reset the mocked file system by clearing all entries
  // This clears the entire mock file system to ensure test isolation
  await deleteDirectories("/");
};

interface BasePostFile {
  content: string | string[];
  meta: TestPostInputMetadata | null;
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
  manifest: TestPostManifest,
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
  meta: TestPostInputMetadata | null,
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

export const getValidatedManifestFile = async (
  options: Partial<UpdateOptions> = {},
): Promise<TestPostManifest> => {
  const defaultedUpdateOptions = getDefaultedUpdateOptions(options);

  const fileContent = await getOutputFile(
    "post-manifest.json",
    defaultedUpdateOptions,
  );
  const parsedContent: unknown = JSON.parse(fileContent);

  const manifestValidator = isTestPostManifest;

  if (!manifestValidator(parsedContent)) {
    throw new Error("Invalid manifest structure found in post-manifest.json");
  }

  return parsedContent;
};

export const getPostManifest = async (
  options: Partial<UpdateOptions> = {},
): Promise<TestPostManifest> => {
  const defaultedUpdateOptions = getDefaultedUpdateOptions(options);

  // With the new orchestrator, post manifests are in post-manifest.json
  const fileContent = await getOutputFile(
    "post-manifest.json",
    defaultedUpdateOptions,
  );
  const parsedContent: unknown = JSON.parse(fileContent);

  // Handle both versioned (v2+) and legacy (v1) manifest formats
  if (
    typeof parsedContent === "object" &&
    parsedContent !== null &&
    "version" in parsedContent &&
    "entries" in parsedContent
  ) {
    // New versioned format - return the full manifest structure
    return parsedContent as TestPostManifest;
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
    } as TestPostManifest;
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
): Promise<Result<TestPostManifest, string>> => {
  const defaultedUpdateOptions = getDefaultedUpdateOptions(options);
  // Convert to new orchestrator config
  const orchestratorConfig = { clean: defaultedUpdateOptions.clean };

  // Create content config overrides for posts based on legacy options
  const contentConfigOverrides = {
    ...testContentTypeDefinitions,
    post: {
      ...testContentTypeDefinitions.post,
      ...defaultedUpdateOptions,
    },
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

  return success(postManifest as TestPostManifest);
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
