import type { CheckedBy, TypeAssertion, TypePredicate } from "@jaybeeuu/is";
import { is, isObject, isArrayOf, isRecordOf } from "@jaybeeuu/is";
import path from "node:path";
import type { Manifest, ManifestEntry } from "./services/manifest/index.js";

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
export interface ContentFilePatterns {
  frontmatter: readonly string[];
  jsonMetadata: readonly string[];
  jsonFileExt: string;
}

export interface ContentTypeDefinition<
  Type extends string = string,
  InputMeta = UnknownRecord,
  CustomManifestEntryProps = InputMeta & BaseInputMetadata,
> {
  readonly contentType: Type;
  readonly filePatterns: ContentFilePatterns;
  readonly generateSlug: (filePath: string, sourceDir: string) => string;
  readonly generateFileName: (slug: string, html: string) => string;

  /** Validates raw input data from frontmatter/JSON files - TypeScript user-defined type guard */
  readonly validateInputMeta: (data: unknown) => data is InputMeta;

  /** Maps validated input metadata and content to output metadata. Always required for explicit data transformation. */
  readonly mapToManifestEntry: (
    input: InputMeta & BaseInputMetadata,
    content: string,
  ) => CustomManifestEntryProps;

  readonly requireOldManifest: boolean;
  readonly manifestFileName: string;
  readonly sourceDir: string;
  readonly outputDir: string;
  readonly additionalWatchPaths: string[];
  readonly oldManifestLocators: string[];
  readonly hrefRoot: string;
  readonly includeUnpublished: boolean;
  readonly codeLineNumbers: boolean;
  readonly removeH1: boolean;
}

const isContentTypeDefinition: TypePredicate<ContentTypeDefinition> = isObject({
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

const assertIsContentTypeDefinition: TypeAssertion<ContentTypeDefinition> =
  isContentTypeDefinition.assert;

export type CustomManifestEntryProperties<
  ContentDef extends ContentTypeDefinition,
> =
  ContentDef extends ContentTypeDefinition<string, UnknownRecord, infer Props>
    ? Props
    : never;

export type ContentDefManifest<ContentDef extends ContentTypeDefinition> =
  Manifest<CustomManifestEntryProperties<ContentDef>>;

export type ContentDefManifestEntry<ContentDef extends ContentTypeDefinition> =
  ManifestEntry<CustomManifestEntryProperties<ContentDef>>;

export type ContentDefInputMeta<ContentDef extends ContentTypeDefinition> =
  ContentDef extends ContentTypeDefinition<
    string,
    infer InputMeta,
    UnknownRecord
  >
    ? InputMeta & BaseInputMetadata
    : never;

export type ContentDefType<ContentDef extends ContentTypeDefinition> =
  ContentDef extends ContentTypeDefinition<string, UnknownRecord, UnknownRecord>
    ? ContentDef["contentType"]
    : never;

export type AllRequired<Target> = {
  [P in keyof Target]-?: Exclude<Target[P], undefined>;
};

/**
 * Configuration object that defines content types for a compost project
 */
export interface CompostConfig<
  ContentTypeDefs extends {
    [key: string]: ContentTypeDefinition;
  } = { [key: string]: ContentTypeDefinition },
> {
  readonly contentTypes: ContentTypeDefs;
}

/**
 * Input interface for content type definitions - allows optional properties for user convenience.
 * createCompostConfig will fill in all defaults.
 */
export type ContentTypeDefinitionInput<
  InputMeta = UnknownRecord,
  CustomManifestEntryProps = InputMeta & BaseInputMetadata,
> = Partial<
  Omit<
    ContentTypeDefinition<string, InputMeta, CustomManifestEntryProps>,
    "contentType" | "filePatterns"
  >
> & {
  readonly filePatterns?: Partial<ContentFilePatterns>;
};

export type DefaultedContentTypeDefinition<
  Type extends string,
  ContentTypeInput extends ContentTypeDefinitionInput,
> =
  ContentTypeInput extends ContentTypeDefinitionInput<
    infer InputMeta,
    infer CustomManifestEntryProps
  >
    ? ContentTypeDefinition<Type, InputMeta, CustomManifestEntryProps>
    : never;

// Overload: When mapToManifestEntry is provided, infer from its signature
export function createContentTypeDefinition<
  Type extends string,
  const Input extends {
    readonly validateInputMeta?: (data: unknown) => data is any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    readonly mapToManifestEntry: (input: any, content: string) => any;
  },
>(
  contentType: Type,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  input: Input & ContentTypeDefinitionInput<any, any>,
): Input["mapToManifestEntry"] extends (
  input: infer InputMeta & BaseInputMetadata,
  content: string,
) => infer CustomManifestEntryProps
  ? ContentTypeDefinition<Type, InputMeta, CustomManifestEntryProps>
  : never;

// Overload: Generic case without explicit mapToManifestEntry
export function createContentTypeDefinition<
  Type extends string,
  ContentTypeInput extends ContentTypeDefinitionInput,
>(
  contentType: Type,
  input: ContentTypeInput,
): DefaultedContentTypeDefinition<Type, ContentTypeInput>;

// Implementation
export function createContentTypeDefinition<
  Type extends string,
  ContentTypeInput extends ContentTypeDefinitionInput,
>(
  contentType: Type,
  input: ContentTypeInput,
): DefaultedContentTypeDefinition<Type, ContentTypeInput> {
  const defaulted = {
    ...input,
    contentType,
    filePatterns: {
      frontmatter: [`.${contentType}.md`],
      jsonMetadata: [`.${contentType}.md`],
      jsonFileType: `.json`,
      ...input.filePatterns,
    },
    hrefRoot: input.hrefRoot ?? contentType,
    validateInputMeta: input.validateInputMeta ?? isObject({} as const),
    generateSlug: input.generateSlug ?? defaultGenerateSlug,
    generateFileName: input.generateFileName ?? defaultGenerateFileName,
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

  assertIsContentTypeDefinition(defaulted);

  return defaulted as unknown as DefaultedContentTypeDefinition<
    Type,
    ContentTypeInput
  >;
}

// Overload: Generic case
export function createCompostConfig<
  const ContentTypeInputs extends { [key: string]: ContentTypeDefinitionInput },
>(
  contentInputs: ContentTypeInputs,
): CompostConfig<{
  [K in keyof ContentTypeInputs]: DefaultedContentTypeDefinition<
    K & string,
    ContentTypeInputs[K]
  >;
}>;

// Implementation
export function createCompostConfig<
  const ContentTypeInputs extends { [key: string]: ContentTypeDefinitionInput },
>(
  contentInputs: ContentTypeInputs,
): CompostConfig<{
  [K in keyof ContentTypeInputs]: DefaultedContentTypeDefinition<
    K & string,
    ContentTypeInputs[K]
  >;
}> {
  const contentTypes = Object.fromEntries(
    Object.entries(contentInputs).map(([key, input]) => [
      key,
      createContentTypeDefinition(key, input),
    ]),
  ) as {
    [K in keyof ContentTypeInputs]: DefaultedContentTypeDefinition<
      K & string,
      ContentTypeInputs[K]
    >;
  };

  return { contentTypes };
}

/**
 * Default slug generation function - converts file path to URL-friendly slug.
 */
const defaultGenerateSlug = (filePath: string, sourceDir: string): string => {
  const relativePath = path.relative(sourceDir, filePath);
  const parsedPath = path.parse(relativePath);
  const dirPath = parsedPath.dir ? `${parsedPath.dir}/` : "";
  return `${dirPath}${parsedPath.name}`.replace(/\\/g, "/");
};

/**
 * Default file name generation function - creates HTML filename from slug.
 */
const defaultGenerateFileName = (slug: string): string => {
  return `${slug}.html`;
};

/**
 * Identity mapping function - returns input metadata as-is.
 * Use this when your input and output metadata have the same shape.
 */
const identityMapping = <InputType>(input: InputType): InputType => input;

/**
 * Validates the structure of a CompostConfig object
 */
export const isCompostConfig = isObject({
  contentTypes: isRecordOf(isContentTypeDefinition),
} as const);

export const assertIsCompostConfig: TypeAssertion<CompostConfig> =
  isCompostConfig.assert;

/**
 * Validates a CompostConfig with proper content type validation
 */
export const validateCompostConfig = (data: unknown): data is CompostConfig => {
  if (!isCompostConfig(data)) {
    return false;
  }

  // Check that all contentTypes entries are valid ContentTypeDefinitions
  for (const [key, value] of Object.entries(data.contentTypes)) {
    if (value.contentType !== key) {
      return false;
    }
  }

  return true;
};

/**
 * Type helper to extract content type definitions from a config
 */
export type ContentTypeDefinitionsFromConfig<Config extends CompostConfig> =
  Config["contentTypes"];
