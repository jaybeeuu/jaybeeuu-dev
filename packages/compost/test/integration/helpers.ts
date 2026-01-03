import type * as utilities from "@jaybeeuu/utilities";
import type { Result } from "@jaybeeuu/utilities";
import { assertIsNotNullish, success } from "@jaybeeuu/utilities";
import { jest } from "@jest/globals";
import path from "node:path";
import { is, isObject } from "@jaybeeuu/is";
import type { CheckedBy } from "@jaybeeuu/is";
import type {
  ContentDefinition,
  OrchestratorConfig,
} from "../../src/config.js";
import { isManifest } from "../../src/manifest.js";
import { compost } from "../../src/index.js";
import type { File } from "../../src/files/index.js";
import {
  deleteDirectories,
  writeTextFiles,
  readTextFile,
} from "../../src/files/index.js";
import type { ManifestEntry, Manifest } from "../../src/manifest.js";
import {
  type BaseInputMetadata,
  type ContentDefinitionInput,
  createContentDefinition,
} from "../../src/content/content-definition.js";

jest.mock("node:fs");
jest.mock<typeof utilities>("@jaybeeuu/utilities", () => {
  const utils = jest.requireActual<typeof utilities>("@jaybeeuu/utilities");
  return {
    ...utils,
    log: {
      error: jest.fn(),
      getErrorMessage: jest.fn<(err: unknown) => string>(),
      info: jest.fn(),
      warn: jest.fn(),
    },
  };
});

export const isTestPostInputMetadata = isObject({
  abstract: is("string"),
  stars: is("number"),
} as const);
export type TestPostInputMetadata = CheckedBy<typeof isTestPostInputMetadata>;

export const isTestPostCustomManifestEntryProperties = isObject({
  abstract: is("string"),
  stars: is("number"),
  contentLength: is("number"),
});

export type TestPostCustomManifestEntryProperties = CheckedBy<
  typeof isTestPostCustomManifestEntryProperties
>;

export type TestPostManifest = Manifest<TestPostManifestEntry>;
export type TestPostManifestEntry =
  ManifestEntry<TestPostCustomManifestEntryProperties>;
export const isTestPostManifest = isManifest<TestPostManifestEntry>(
  isTestPostCustomManifestEntryProperties,
);

export type TestContentDefinition = ContentDefinition<
  "post",
  TestPostInputMetadata,
  TestPostCustomManifestEntryProperties
>;

export type TestPostContentDefinitionInput = ContentDefinitionInput<
  TestPostInputMetadata,
  TestPostCustomManifestEntryProperties
>;

export const cleanUpDirectories = async (): Promise<void> => {
  // Reset the mocked file system by clearing all entries
  // This clears the entire mock file system to ensure test isolation
  await deleteDirectories("/");
};

export type TestPostFileMeta = Partial<
  TestPostInputMetadata & BaseInputMetadata
>;

export interface BasePostFile {
  content: string | string[];
  meta: TestPostFileMeta | null;
  path?: string;
  slug: string;
  otherFiles?: {
    content: string;
    path: string;
  }[];
}

export interface PostFileWithFrontmatter extends BasePostFile {
  metadataStyle: "frontmatter";
}

export interface PostFileWithJson extends BasePostFile {
  metadataStyle?: "json";
}

type TestPostContentDefinition = ContentDefinition<
  "post",
  TestPostInputMetadata,
  TestPostCustomManifestEntryProperties
>;

export type PostFile = PostFileWithFrontmatter | PostFileWithJson;

const getTestContentDef = (
  input: TestPostContentDefinitionInput = {},
): TestPostContentDefinition => {
  const defaultedHrefRoot = input.hrefRoot ?? "posts";

  return createContentDefinition("post", {
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
    mapToManifestEntry: (metadata: TestPostInputMetadata, content: string) => {
      return {
        stars: metadata.stars,
        abstract: metadata.abstract,
        contentLength: content.length,
      };
    },
    ...input,
    filePatterns: {
      frontmatter: [`.post.md`],
      jsonMetadata: [`.md`],
      jsonFileExt: `.post.json`,
      ...input.filePatterns,
    },
  });
};

const createDefaultedMeta = (
  meta: Partial<TestPostInputMetadata & BaseInputMetadata> | null,
): Partial<TestPostInputMetadata & BaseInputMetadata> | null => {
  return meta
    ? {
        stars: 0,
        abstract: "Default abstract",
        publish: true,
        title: "Default title",
        ...meta,
      }
    : null;
};

const getMarkdownContent = (
  content: string | string[],
  meta: Partial<TestPostInputMetadata & BaseInputMetadata> | null,
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
  const defaultedMeta = createDefaultedMeta(meta);
  return [
    {
      path: path.join(postPath, `${slug}.post.md`),
      content: getMarkdownContent(content, defaultedMeta),
    },
  ];
};

const writeJsonPost = (
  postFile: PostFileWithJson,
  postPath: string,
): File[] => {
  const { content, meta, slug } = postFile;
  const defaultedMeta = createDefaultedMeta(meta);
  const markdownContent = Array.isArray(content) ? content.join("\n") : content;

  const files: File[] = [
    {
      path: path.join(postPath, `${slug}.md`),
      content: markdownContent,
    },
  ];

  if (defaultedMeta !== null) {
    files.push({
      path: path.join(postPath, `${slug}.post.json`),
      content: JSON.stringify(defaultedMeta, null, 2),
    });
  }

  return files;
};

export const writePostFile = async (
  postFile: PostFile,
  options: Partial<TestPostContentDefinitionInput> = {},
): Promise<void> => {
  const contentDef = getTestContentDef(options);

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

  await writeTextFiles(contentDef.sourceDir, allFiles);
};

export const getOutputFile = async (
  filePath: string,
  options: Partial<TestPostContentDefinitionInput>,
): Promise<string> => {
  const contentDef = getTestContentDef(options);
  const resolvedFilePath = path.join(contentDef.outputDir, filePath);

  return readTextFile(resolvedFilePath);
};

export const getPostManifest = async (
  options: Partial<TestPostContentDefinitionInput> = {},
): Promise<TestPostManifest> => {
  const contentDef = getTestContentDef(options);

  const fileContent = await getOutputFile("post-manifest.json", contentDef);
  const parsedContent: unknown = JSON.parse(fileContent);

  return parsedContent as TestPostManifest;
};

export const getPost = async (
  slug: string,
  options: Partial<TestPostContentDefinitionInput> = {},
): Promise<string> => {
  const manifest = await getPostManifest(options);
  const contentDef = getTestContentDef(options);
  const manifestEntry = manifest.entries[slug];
  assertIsNotNullish(manifestEntry);

  const relativePath = path.relative(
    contentDef.hrefRoot,
    `.${manifestEntry.href}`,
  );

  return await getOutputFile(relativePath, options);
};

export const compilePosts = async (
  options?: Partial<TestPostContentDefinitionInput>,
): Promise<Result<TestPostManifest, string>> => {
  const contentDef = getTestContentDef(options);

  const orchestratorConfig: OrchestratorConfig = { clean: false };

  const updateResult = await compost(contentDef, orchestratorConfig);
  if (!updateResult.success) {
    return updateResult;
  }

  // Extract post manifest from the result (it's under the 'post' key)
  const postManifest = updateResult.value;

  return success(postManifest as TestPostManifest);
};

export const getCompiledPostWithContent = async (
  contentOrPost: string[] | RecursivePartial<PostFile>,
  options: TestPostContentDefinitionInput = {},
): Promise<string> => {
  await cleanUpDirectories();

  const userPost = Array.isArray(contentOrPost)
    ? { content: contentOrPost }
    : contentOrPost;

  const contentDef = getTestContentDef(options);
  const postFile = {
    slug: "test-slug",
    content: ["{content}"],
    path: contentDef.sourceDir,
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
