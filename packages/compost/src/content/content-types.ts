import type { CheckedBy } from "@jaybeeuu/is";
import { is, isObject, isArrayOf, isRecordOf } from "@jaybeeuu/is";
import path from "node:path";
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

export type ContentDefManifestFile<ContentDef extends ContentTypeDefinition> =
  ContentDef extends ContentTypeDefinition<
    string,
    UnknownRecord,
    infer OutputMeta
  >
    ? Manifest<OutputMeta>
    : never;

export type ContentDefOutputMeta<ContentDef extends ContentTypeDefinition> =
  ContentDef extends ContentTypeDefinition<
    string,
    UnknownRecord,
    infer OutputMeta
  >
    ? OutputMeta
    : never;

export type ContentDefInputMeta<ContentDef extends ContentTypeDefinition> =
  ContentDef extends ContentTypeDefinition<
    string,
    infer InputMeta,
    UnknownRecord
  >
    ? InputMeta & BaseInputMeta
    : never;

export type ContentDefType<ContentDef extends ContentTypeDefinition> =
  ContentDef extends ContentTypeDefinition<string, UnknownRecord, UnknownRecord>
    ? ContentDef["contentType"]
    : never;

export type ContentDefResolvedContent<
  ContentDef extends ContentTypeDefinition,
> = {
  /** The identified content type */
  type: ContentDefType<ContentDef>;
  /** The raw metadata (validation happens later in the processing pipeline) */
  metadata: ContentDefInputMeta<ContentDef>;
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
 * Input interface for content type definitions - allows optional properties for user convenience.
 * createCompostConfig will fill in all defaults.
 */
export interface ContentTypeDefinitionInput<
  InputMeta = UnknownRecord,
  OutputMeta = InputMeta & BaseInputMeta,
> {
  readonly filePatterns: ContentFilePatterns;
  readonly generateSlug?: (filePath: string, sourceDir: string) => string;
  readonly generateFileName?: (slug: string, html: string) => string;

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
  readonly includeUnpublished?: boolean;
  readonly codeLineNumbers?: boolean;
  readonly removeH1?: boolean;
}

export type DefaultedContentTypeDefinition<
  Type extends string,
  ContentTypeInput extends ContentTypeDefinitionInput,
> =
  ContentTypeInput extends ContentTypeDefinitionInput<
    infer InputMeta,
    infer OutputMeta
  >
    ? ContentTypeDefinition<Type, InputMeta, OutputMeta>
    : never;

/**
 * Helper function to create a properly typed CompostConfig.
 * Automatically fills in defaults for optional properties and provides identity mapping when missing.
 *
 * Note: For strongest type inference with specific types, use createContentTypeDef to create each content type first.
 */
export function createCompostConfig<
  const ContentDefKeys extends string,
  const ContentTypeInputs extends {
    [Key in ContentDefKeys]: ContentTypeDefinitionInput;
  },
>(
  contentType: string,
  contentInputs: ContentTypeInputs,
): CompostConfig<{
  [K in ContentDefKeys]: DefaultedContentTypeDefinition<
    K,
    ContentTypeInputs[K]
  >;
}> {
  const contentTypes = Object.fromEntries(
    Object.entries(contentInputs).map(([key, input]) => [
      key,
      {
        ...input,
        generateSlug: input.generateSlug ?? defaultGenerateSlug,
        generateFileName: input.generateFileName ?? defaultGenerateFileName,
        requireOldManifest: input.requireOldManifest ?? true,
        manifestFileName:
          input.manifestFileName ?? `${contentType}-manifest.json`,
        sourceDir: input.sourceDir ?? "src",
        outputDir: input.outputDir ?? "out",
        oldManifestLocators: input.oldManifestLocators ?? [],
        mapToOutputMeta: input.mapToOutputMeta ?? identityMapping,
        includeUnpublished: input.includeUnpublished ?? false,
        codeLineNumbers: input.codeLineNumbers ?? true,
        removeH1: input.removeH1 ?? true,
      },
    ]),
  );

  return { contentTypes } as CompostConfig<{
    [K in keyof ContentTypeInputs]: DefaultedContentTypeDefinition<
      ContentTypeInputs[K]
    >;
  }>;
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
 * Default slug generation function - converts file path to URL-friendly slug.
 */
export const defaultGenerateSlug = (
  filePath: string,
  sourceDir: string,
): string => {
  const relativePath = path.relative(sourceDir, filePath);
  const parsedPath = path.parse(relativePath);
  const dirPath = parsedPath.dir ? `${parsedPath.dir}/` : "";
  return `${dirPath}${parsedPath.name}`.replace(/\\/g, "/");
};

/**
 * Default file name generation function - creates HTML filename from slug.
 */
export const defaultGenerateFileName = (slug: string): string => {
  return `${slug}.html`;
};

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
