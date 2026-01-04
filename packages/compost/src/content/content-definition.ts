import type { CheckedBy, TypeAssertion, TypePredicate } from "@jaybeeuu/is";
import { is, isArrayOf, isObject } from "@jaybeeuu/is";
import { getCompiledPostFileName, getSlug } from "./services/file-paths.js";
import type { Manifest, ManifestEntry } from "../manifest.js";

/**
 * Utility type for representing an unknown object with string keys
 */
export type UnknownRecord = { [key: string]: unknown };

/**
 * Base input metadata interface that all content types must extend.
 * Contains the minimum required fields for content processing.
 */
export interface BaseInputMetadata {
  /** Title of the content */
  title: string;
  /** Whether content should be published (used for filtering, not stored in output) */
  publish: boolean;
}

/**
 * Validator for base input metadata fields
 */
export const isBaseInputMetadata = isObject({
  title: is("string"),
  publish: is("boolean"),
} as const);
export type BaseInputMetadataValidated = CheckedBy<typeof isBaseInputMetadata>;

const isFilePatterns = isObject({
  frontmatter: isArrayOf(is("string")),
  jsonMetadata: isArrayOf(is("string")),
  jsonFileExt: is("string"),
});
export type FilePatterns = CheckedBy<typeof isFilePatterns>;

/**
 * File pattern configuration for content discovery.
 */
export interface ContentFilePatterns {
  /** File suffixes for markdown files with YAML frontmatter (default: [".{contentType}.md"]) */
  frontmatter: readonly string[];
  /** File suffixes for markdown files with separate JSON metadata (default: [".md"]) */
  jsonMetadata: readonly string[];
  /** Extension for JSON metadata files (default: ".{contentType}.json") */
  jsonFileExt: string;
}

/**
 * Complete configuration for a content type.
 *
 * @template Type - The content type identifier string
 * @template InputMeta - The metadata shape expected in frontmatter/JSON files
 * @template CustomManifestEntryProps - Additional properties added to manifest entries
 */
export interface ContentDefinition<
  Type extends string = string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  InputMeta = any,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  CustomManifestEntryProps = any,
> {
  /** The content type identifier (e.g., "post", "article") */
  readonly contentType: Type;

  /** File pattern configuration for content discovery */
  readonly filePatterns: ContentFilePatterns;

  /** Generate a URL-friendly slug from file info. Default: filename without extension */
  readonly generateSlug: (args: {
    filePath: string;
    sourceDir: string;
    hash: string;
    html: string;
  }) => string;

  /** Generate the output HTML filename. Default: "{slug}-{hash}.html" */
  readonly generateFileName: (args: {
    filePath: string;
    sourceDir: string;
    slug: string;
    hash: string;
    html: string;
  }) => string;

  /** Type guard to validate frontmatter/JSON metadata. Return true if data matches InputMeta shape */
  readonly validateInputMeta: (data: unknown) => data is InputMeta;

  /** Transform input metadata to manifest entry properties. Receives validated metadata and raw content */
  readonly mapToManifestEntry: (
    input: InputMeta & BaseInputMetadata,
    content: string,
  ) => CustomManifestEntryProps;

  /** Fail if no previous manifest found. Useful for preserving publish dates (default: true) */
  readonly requireOldManifest: boolean;

  /** Output manifest filename (default: "{contentType}-manifest.json") */
  readonly manifestFileName: string;

  /** Directory containing source markdown files */
  readonly sourceDir: string;

  /** Directory for compiled HTML and manifest output */
  readonly outputDir: string;

  /** Extra paths to watch in watch mode */
  readonly additionalWatchPaths: string[];

  /** URLs or file paths to fetch previous manifest for date tracking */
  readonly oldManifestLocators: string[];

  /** URL prefix for generated hrefs (default: contentType) */
  readonly hrefRoot: string;

  /** Include content with publish: false (default: false) */
  readonly includeUnpublished: boolean;

  /** Add line number markup to code blocks for Prism styling (default: true) */
  readonly codeLineNumbers: boolean;

  /** Strip H1 headings from output, useful when rendering title separately (default: true) */
  readonly removeH1: boolean;
}

export const isContentDefinition: TypePredicate<ContentDefinition> = isObject({
  contentType: is("string"),
  filePatterns: isFilePatterns,
  generateSlug: is("function"),
  generateFileName: is("function"),
  validateInputMeta: is(
    (
      value: unknown,
    ): value is (candidate: unknown) => candidate is UnknownRecord =>
      typeof value === "function",
  ),
  mapToManifestEntry: is("function"),
  requireOldManifest: is("boolean"),
  manifestFileName: is("string"),
  sourceDir: is("string"),
  outputDir: is("string"),
  additionalWatchPaths: isArrayOf(is("string")),
  oldManifestLocators: isArrayOf(is("string")),
  hrefRoot: is("string"),
  includeUnpublished: is("boolean"),
  codeLineNumbers: is("boolean"),
  removeH1: is("boolean"),
} as const);

export const assertIsContentDefinition: TypeAssertion<ContentDefinition> =
  isContentDefinition.assert;

export type CustomManifestEntryProperties<
  ContentDef extends ContentDefinition,
> =
  ContentDef extends ContentDefinition<string, UnknownRecord, infer Props>
    ? Props
    : never;

export type ContentDefManifest<ContentDef extends ContentDefinition> = Manifest<
  CustomManifestEntryProperties<ContentDef>
>;

export type ContentDefManifestEntry<ContentDef extends ContentDefinition> =
  ManifestEntry<CustomManifestEntryProperties<ContentDef>>;

export type ContentDefInputMeta<ContentDef extends ContentDefinition> =
  ContentDef extends ContentDefinition<string, infer InputMeta, UnknownRecord>
    ? InputMeta & BaseInputMetadata
    : never;

export type ContentDefType<ContentDef extends ContentDefinition> =
  ContentDef extends ContentDefinition<string, UnknownRecord, UnknownRecord>
    ? ContentDef["contentType"]
    : never;

export type AllRequired<Target> = {
  [P in keyof Target]-?: Exclude<Target[P], undefined>;
};

/**
 * Input interface for content type definitions - allows optional properties for user convenience.
 * createContentDefinition will fill in all defaults.
 */
export type ContentDefinitionInput<
  InputMeta = UnknownRecord,
  CustomManifestEntryProps = InputMeta & BaseInputMetadata,
> = Partial<
  Omit<
    ContentDefinition<string, InputMeta, CustomManifestEntryProps>,
    "contentType" | "filePatterns"
  >
> & {
  readonly filePatterns?: Partial<ContentFilePatterns>;
};

export type DefaultedContentDefinition<
  Type extends string,
  ContentTypeInput extends ContentDefinitionInput,
> =
  ContentTypeInput extends ContentDefinitionInput<
    infer InputMeta,
    infer CustomManifestEntryProps
  >
    ? ContentDefinition<Type, InputMeta, CustomManifestEntryProps>
    : never;

/**
 * Identity mapping function - returns input metadata as-is.
 * Use this when your input and output metadata have the same shape.
 */
const identityMapping = <InputType>(input: InputType): InputType => input;

export interface CreateContentDefinition {
  <Type extends string, ContentTypeInput extends ContentDefinitionInput>(
    contentType: Type,
    input: ContentTypeInput,
  ): DefaultedContentDefinition<Type, ContentTypeInput>;
  <
    Type extends string,
    const Input extends {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readonly validateInputMeta?: (data: unknown) => data is any;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      readonly mapToManifestEntry: (input: any, content: string) => any;
    },
  >(
    contentType: Type,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    input: Input & ContentDefinitionInput<any, any>,
  ): Input["mapToManifestEntry"] extends (
    input: infer InputMeta & BaseInputMetadata,
    content: string,
  ) => infer CustomManifestEntryProps
    ? ContentDefinition<Type, InputMeta, CustomManifestEntryProps>
    : never;
}
export const createContentDefinition: CreateContentDefinition = <
  Type extends string,
  ContentTypeInput extends ContentDefinitionInput,
>(
  contentType: Type,
  input: ContentTypeInput,
): DefaultedContentDefinition<Type, ContentTypeInput> => {
  const defaulted = {
    ...input,
    contentType,
    filePatterns: {
      frontmatter: [`.${contentType}.md`],
      jsonMetadata: [`.md`],
      jsonFileExt: `.${contentType}.json`,
      ...input.filePatterns,
    },
    hrefRoot: input.hrefRoot ?? contentType,
    validateInputMeta: input.validateInputMeta ?? isObject({}),
    generateSlug: input.generateSlug ?? getSlug,
    generateFileName: input.generateFileName ?? getCompiledPostFileName,
    requireOldManifest: input.requireOldManifest ?? true,
    manifestFileName: input.manifestFileName ?? `${contentType}-manifest.json`,
    sourceDir: input.sourceDir ?? "src",
    outputDir: input.outputDir ?? "out",
    additionalWatchPaths: input.additionalWatchPaths ?? [],
    oldManifestLocators: input.oldManifestLocators ?? [],
    mapToManifestEntry: input.mapToManifestEntry ?? identityMapping,
    includeUnpublished: input.includeUnpublished ?? false,
    codeLineNumbers: input.codeLineNumbers ?? true,
    removeH1: input.removeH1 ?? true,
  };

  assertIsContentDefinition(defaulted);

  return defaulted as unknown as DefaultedContentDefinition<
    Type,
    ContentTypeInput
  >;
};
