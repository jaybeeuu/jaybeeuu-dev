import type { CheckedBy } from "@jaybeeuu/is";
import { is, isObject, isArrayOf, isRecordOf } from "@jaybeeuu/is";
import type { Manifest } from "./services/manifest";

/**
 * Utility type for representing an unknown object with string keys
 */
export type UnknownRecord = { [key: string]: unknown };

/**
 * Base input metadata interface that all content types must extend.
 * Contains the minimum required fields for content processing.
 */
export interface BaseInputMeta {
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

export interface ContentFilePatterns {
  frontmatter: readonly string[];
  jsonMetadata: readonly string[];
  jsonSuffix: string;
}

export interface ContentTypeDefinition<
  Type extends string = string,
  InputMeta = UnknownRecord,
  OutputMeta = InputMeta & BaseInputMeta,
> {
  readonly contentType: Type;
  readonly filePatterns: ContentFilePatterns;
  readonly generateSlug: (filePath: string, sourceDir: string) => string;
  readonly generateFileName: (slug: string, html: string) => string;

  /** Validates raw input data from frontmatter/JSON files - TypeScript user-defined type guard */
  readonly validateInputMeta: (data: unknown) => data is InputMeta;

  /** Maps validated input metadata and content to output metadata. Always required for explicit data transformation. */
  readonly mapToOutputMeta: (
    input: InputMeta & BaseInputMeta,
    content: string,
  ) => OutputMeta;

  readonly requireOldManifest: boolean;
  readonly manifestFileName: string;
  readonly sourceDir: string;
  readonly outputDir: string;
  readonly oldManifestLocators: string[];
  readonly hrefRoot: string;
  readonly includeUnpublished: boolean;
  readonly codeLineNumbers: boolean;
  readonly removeH1: boolean;
}

export type ContentDefManifestFile<Content extends ContentTypeDefinition> =
  Content extends ContentTypeDefinition<string, UnknownRecord, infer OutputMeta>
    ? Manifest<OutputMeta>
    : never;

export type ContentDefOutputMeta<Content extends ContentTypeDefinition> =
  Content extends ContentTypeDefinition<string, UnknownRecord, infer OutputMeta>
    ? OutputMeta
    : never;

export type ContentDefInputMeta<Content extends ContentTypeDefinition> =
  Content extends ContentTypeDefinition<string, infer InputMeta, UnknownRecord>
    ? InputMeta & BaseInputMeta
    : never;

export type ContentDefType<Content extends ContentTypeDefinition> =
  Content extends ContentTypeDefinition<string, UnknownRecord, UnknownRecord>
    ? Content["contentType"]
    : never;

export type ContentDefResolvedContent<Content extends ContentTypeDefinition> = {
  /** The identified content type */
  type: ContentDefType<Content>;
  /** The raw metadata (validation happens later in the processing pipeline) */
  metadata: ContentDefInputMeta<Content>;
  /** The markdown content (without frontmatter) */
  content: string;
};

export type AllRequired<Target> = {
  [P in keyof Target]-?: Exclude<Target[P], undefined>;
};

/**
 * ResolvedContentDefinition is derived directly from a ContentTypeDefinition with all optional fields filled in.
 * This represents the configuration after applying defaults.
 */
export type ResolvedContentDefinition<Definition> =
  Definition extends ContentTypeDefinition<
    infer Type,
    infer InputMeta,
    infer OutputMeta
  >
    ? AllRequired<ContentTypeDefinition<Type, InputMeta, OutputMeta>>
    : never;

export type ResolvedContentDefinitionMap<
  ConfigMap extends {
    [key: string]: ContentTypeDefinition;
  },
> = {
  readonly [K in keyof ConfigMap]: ResolvedContentDefinition<ConfigMap[K]>;
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
 * Helper type to infer content type definitions from a config
 */
export type InferContentTypes<ConfigType> =
  ConfigType extends CompostConfig<infer ContentTypeDefs>
    ? ContentTypeDefs
    : never;

/**
 * Input interface for content type definitions - allows optional properties for user convenience.
 * createCompostConfig will fill in all defaults.
 */
export interface ContentTypeDefinitionInput<
  Type extends string = string,
  InputMeta = UnknownRecord,
  OutputMeta = InputMeta & BaseInputMeta,
> {
  readonly contentType: Type;
  readonly filePatterns: ContentFilePatterns;
  readonly generateSlug: (filePath: string, sourceDir: string) => string;
  readonly generateFileName: (slug: string, html: string) => string;

  /** Validates raw input data from frontmatter/JSON files - TypeScript user-defined type guard */
  readonly validateInputMeta: (data: unknown) => data is InputMeta;

  /** Maps validated input metadata and content to output metadata. If not provided, identity mapping is used. */
  readonly mapToOutputMeta?: (
    input: InputMeta & BaseInputMeta,
    content: string,
  ) => OutputMeta;

  readonly requireOldManifest?: boolean;
  readonly manifestFileName?: string;
  readonly sourceDir?: string;
  readonly outputDir?: string;
  readonly oldManifestLocators?: string[];
  readonly hrefRoot: string;
  readonly includeUnpublished: boolean;
  readonly codeLineNumbers: boolean;
  readonly removeH1: boolean;
}

/**
 * Helper type to transform ContentTypeDefinitionInput to ContentTypeDefinition
 */
type ResolveContentTypeInput<Input> =
  Input extends ContentTypeDefinitionInput<
    infer Type,
    infer InputMeta,
    infer OutputMeta
  >
    ? ContentTypeDefinition<Type, InputMeta, OutputMeta>
    : never;

/**
 * Helper type to transform the input object to fully resolved content types
 */
type ResolvedContentTypesFromInputs<
  ContentTypeInputs extends Record<string, ContentTypeDefinitionInput>,
> = {
  [K in keyof ContentTypeInputs]: ResolveContentTypeInput<ContentTypeInputs[K]>;
};

/**
 * Helper function to create a properly typed CompostConfig.
 * Automatically fills in defaults for optional properties and provides identity mapping when missing.
 */
export function createCompostConfig<
  ContentTypeInputs extends Record<string, ContentTypeDefinitionInput>,
>(
  contentInputs: ContentTypeInputs,
): CompostConfig<ResolvedContentTypesFromInputs<ContentTypeInputs>> {
  const contentTypes = Object.fromEntries(
    Object.entries(contentInputs).map(([key, input]) => [
      key,
      {
        ...input,
        requireOldManifest: input.requireOldManifest ?? true,
        manifestFileName:
          input.manifestFileName ?? `${input.contentType}-manifest.json`,
        sourceDir: input.sourceDir ?? "src",
        outputDir: input.outputDir ?? "out",
        oldManifestLocators: input.oldManifestLocators ?? [],
        mapToOutputMeta: input.mapToOutputMeta ?? identityMapping,
      } satisfies ContentTypeDefinition,
    ]),
  ) as ResolvedContentTypesFromInputs<ContentTypeInputs>;

  return { contentTypes };
}

/**
 * Helper to create content type definition with automatic identity mapping.
 * Use this when your input and output metadata have the same shape.
 */
export function createSimpleContentType<
  Type extends string,
  InputMeta = UnknownRecord,
>(
  definition: Omit<
    ContentTypeDefinition<Type, InputMeta, InputMeta & BaseInputMeta>,
    "mapToOutputMeta"
  >,
): ContentTypeDefinition<Type, InputMeta, InputMeta & BaseInputMeta> {
  return {
    ...definition,
    mapToOutputMeta: identityMapping,
  };
}

/**
 * Identity mapping function - returns input metadata as-is.
 * Use this when your input and output metadata have the same shape.
 */
export const identityMapping = <InputType>(input: InputType): InputType =>
  input;

/**
 * Helper function to create a typed mapping function.
 * Provides better type inference for complex transformations.
 */
export const createMapping = <Input, Output>(
  fn: (input: Input, content: string) => Output,
): ((input: Input, content: string) => Output) => fn;

/**
 * Helper function to create a strongly-typed content type definition.
 * This is the recommended way to create content types with full type safety.
 *
 * @param definition - The content type definition with full type safety
 * @returns The same definition with full type information preserved
 */
export function createContentType<Type extends string, InputMeta, OutputMeta>(
  definition: ContentTypeDefinition<Type, InputMeta, OutputMeta>,
): ContentTypeDefinition<Type, InputMeta, OutputMeta> {
  return definition;
}

/**
 * Validates the structure of a ContentTypeDefinitionCore
 */
export const isContentTypeDefinitionCore = isObject({
  contentType: is("string"),
  filePatterns: isObject({
    frontmatter: isArrayOf(is("string")),
    jsonMetadata: isArrayOf(is("string")),
    jsonSuffix: is("string"),
  } as const),
  generateSlug: is("function"),
  generateFileName: is("function"),
  validateInputMeta: is("function"),
  hrefRoot: is("string"),
  includeUnpublished: is("boolean"),
  codeLineNumbers: is("boolean"),
  removeH1: is("boolean"),
} as const);

/**
 * Validates the structure of a ContentTypeDefinition
 */
export const isContentTypeDefinition = isObject({
  contentType: is("string"),
  filePatterns: isObject({
    frontmatter: isArrayOf(is("string")),
    jsonMetadata: isArrayOf(is("string")),
    jsonSuffix: is("string"),
  } as const),
  generateSlug: is("function"),
  generateFileName: is("function"),
  validateInputMeta: is("function"),
  hrefRoot: is("string"),
  includeUnpublished: is("boolean"),
  codeLineNumbers: is("boolean"),
  removeH1: is("boolean"),
} as const);

/**
 * Validates the structure of a CompostConfig object
 */
export const isCompostConfig = isObject({
  contentTypes: isRecordOf(isContentTypeDefinition),
} as const);

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
