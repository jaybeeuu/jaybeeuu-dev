import type { CheckedBy } from "@jaybeeuu/is";
import { is, isObject, isArrayOf, isRecordOf } from "@jaybeeuu/is";

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
  [key: string]: unknown;
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
  OutputMeta = UnknownRecord,
> {
  readonly contentType: Type;
  readonly filePatterns: ContentFilePatterns;
  readonly generateSlug: (filePath: string, sourceDir: string) => string;
  readonly generateFileName: (slug: string, html: string) => string;

  /** Validates raw input data from frontmatter/JSON files - TypeScript user-defined type guard */
  readonly validateInputMeta: (data: unknown) => data is InputMeta;

  /** Maps validated input metadata and content to output metadata. If not provided, all InputMeta fields will be merged into output */
  readonly mapToOutputMeta?: (
    input: InputMeta & BaseInputMetadata,
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
 * ResolvedContentDefinition is derived directly from a ContentTypeDefinition with all optional fields filled in.
 * This represents the configuration after applying defaults.
 */
export type ResolvedContentDefinition<Definition> =
  Definition extends ContentTypeDefinition<
    infer Type,
    infer InputMeta,
    infer OutputMeta
  >
    ? Required<ContentTypeDefinition<Type, InputMeta, OutputMeta>>
    : never;

export type ResolvedContentDefinitionMap<
  ConfigMap extends {
    [key: string]: ContentTypeDefinition;
  },
> = {
  readonly [K in keyof ConfigMap]: ResolvedContentDefinition<ConfigMap[K]>;
};

export type ContentTypesFromConfig<Config> = keyof Config;

export type MetadataMapFromConfig<Config> = {
  readonly [K in keyof Config]: Config[K] extends ContentTypeDefinition<
    string,
    infer InputMeta
  >
    ? InputMeta & BaseInputMetadata
    : never;
};

/**
 * Configuration object that defines content types for a compost project
 */
export interface CompostConfig<
  ContentTypeDefs extends {
    [key: string]: ContentTypeDefinition<string, any, any>;
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
 * Helper function to create a properly typed CompostConfig
 */
export function createCompostConfig<
  ContentTypeDefs extends {
    [key: string]: ContentTypeDefinition<string, any, any>;
  },
>(contentTypes: ContentTypeDefs): CompostConfig<ContentTypeDefs> {
  return { contentTypes };
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
