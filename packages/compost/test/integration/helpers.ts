import type utilities from "@jaybeeuu/utilities";
import type { Result } from "@jaybeeuu/utilities";
import { assertIsNotNullish, success } from "@jaybeeuu/utilities";
import { jest } from "@jest/globals";
import path from "node:path";
import { is, isObject } from "@jaybeeuu/is";
import type { CheckedBy } from "@jaybeeuu/is";
import type {
  Manifest,
  BaseManifestEntry,
  ContentTypeDefinition,
} from "../../src/index.js";
import { isManifest } from "../../src/index.js";
import type { File } from "../../src/files/index.js";
import { deleteDirectories, writeJsonFile } from "../../src/files/index.js";
import type {
  ContentTypeDefinitionInput,
  ContentDefInputMeta,
} from "../../src/content/index.js";
import {
  createCompostConfig,
  createContentTypeDefinition,
} from "../../src/content/index.js";

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

export const isTestPostCustomManifestEntryProperties = isObject({
  abstract: is("string"),
  readingTime: isTestReadingTime,
});

export type TestPostCustomManifestEntryProperties = CheckedBy<
  typeof isTestPostCustomManifestEntryProperties
>;

export type TestPostManifest = Manifest<TestPostManifestEntry>;
export type TestPostManifestEntry = BaseManifestEntry &
  TestPostCustomManifestEntryProperties;
export const isTestPostManifest = isManifest<TestPostManifestEntry>(
  isTestPostCustomManifestEntryProperties,
);

export type TestContentTypeDefinition = ContentTypeDefinition<
  "post",
  TestPostInputMetadata,
  TestPostCustomManifestEntryProperties
>;

export type TestPostContentTypeDefinitionInput = ContentTypeDefinitionInput<
  TestPostInputMetadata,
  TestPostCustomManifestEntryProperties
>;

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

type TestPostContentTypeDefinition = ContentTypeDefinition<
  "post",
  TestPostInputMetadata,
  TestPostCustomManifestEntryProperties
>;

export type PostFile = PostFileWithFrontmatter | PostFileWithJson;

const getDefaultedUpdateOptions = (
  input: TestPostContentTypeDefinitionInput,
): TestPostContentTypeDefinition => {
  const defaultedHrefRoot = input.hrefRoot ?? "posts";

  const postDef = createContentTypeDefinition("post", {
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
    validateInputMeta: isTestPostInputMetadata,
    mapToManifestEntry: (metadata: TestPostInputMetadata) => {
      return {
        abstract: metadata.abstract,
        readingTime: {
          text: "1 min read.",
          time: 1,
          words: 1,
          minutes: 1,
        },
      };
    },
    ...input,
    filePatterns: {
      frontmatter: [`.md`],
      jsonMetadata: [`.md`],
      jsonFileExt: `.json`,
      ...input.filePatterns,
    },
  });

  return postDef;
};

export const writeOutputManifestFile = async (
  manifest: TestPostManifest,
  options: ContentTypeDefinition,
): Promise<void> => {
  await writeJsonFile(
    path.join(options.outputDir, options.manifestFileName),
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
      version: 2,
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
