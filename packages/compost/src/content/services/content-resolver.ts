import type { Result } from "@jaybeeuu/utilities";
import { failure, success } from "@jaybeeuu/utilities";
import type { ReadJsonFileFailureReason } from "../../files/index.js";
import { canAccess, readJsonFile, readTextFile } from "../../files/index.js";
import type { ParseYamlMetaFailureReason } from "./metadata.js";
import { parseYamlMeta } from "./metadata.js";
import type { ContentConfig } from "../content-types.js";

// Re-export the unified ContentConfig as ContentResolverConfig for backward compatibility
export type ContentResolverConfig<
  Type extends string,
  MetaData,
> = ContentConfig<Type, MetaData>;
export type ContentResolverConfigMap<
  Type extends string,
  MetaDataMap extends { [type in Type]: unknown },
> = {
  [K in Type]: ContentResolverConfig<K, MetaDataMap[K]>;
};

/**
 * The result of successfully resolving content from a markdown file.
 *
 * Contains the parsed content, validated metadata, and identified content type.
 *
 * @template Type - The content type identifier
 * @template MetaData - The metadata interface for this content type
 */
export type ResolvedContent<Type extends string, MetaData> = {
  /** The identified content type */
  type: Type;

  /** The validated and typed metadata */
  metadata: MetaData;

  /** The markdown content (without frontmatter) */
  content: string;
};

export type LoadSourceFailureReason = "load source failure";
export type NoFrontMatterFailureReason = "no frontmatter in markdown file";
export type JsonFileNotFoundReason = "json file not found";
export type UnsupportedFileExtensionReason = "unsupported file extension";
export type ContentTypeNotConfiguredReason = "content type not configured";

export type ResolveContentFailureReason =
  | LoadSourceFailureReason
  | NoFrontMatterFailureReason
  | ParseYamlMetaFailureReason
  | JsonFileNotFoundReason
  | ReadJsonFileFailureReason
  | UnsupportedFileExtensionReason
  | ContentTypeNotConfiguredReason;

const loadSourceText = async (
  sourceFilePath: string,
): Promise<Result<string, LoadSourceFailureReason>> => {
  try {
    const sourceText = await readTextFile(sourceFilePath);
    return success(sourceText);
  } catch (error) {
    return failure("load source failure", error);
  }
};

const hasFrontMatter = (sourceFileText: string): boolean => {
  return (
    sourceFileText.startsWith("---\n") &&
    sourceFileText.indexOf("\n---\n", 4) !== -1
  );
};

const resolveFrontmatterContent = async <Type extends string, MetaData>(
  markdownFilePath: string,
  config: ContentResolverConfig<Type, MetaData>,
): Promise<
  Result<ResolvedContent<Type, MetaData>, ResolveContentFailureReason>
> => {
  const sourceFileTextResult = await loadSourceText(markdownFilePath);
  if (!sourceFileTextResult.success) {
    return sourceFileTextResult;
  }

  const sourceFileText = sourceFileTextResult.value;

  if (!hasFrontMatter(sourceFileText)) {
    return failure(
      "no frontmatter in markdown file",
      new Error(`No frontmatter in markdown file: ${markdownFilePath}`),
    );
  }

  const frontMatterEnd = sourceFileText.indexOf("\n---\n", 4);
  const frontMatterText = sourceFileText.slice(4, frontMatterEnd);
  const content = sourceFileText.slice(frontMatterEnd + 5);

  const yamlResult = parseYamlMeta(frontMatterText, config.validator);
  if (!yamlResult.success) {
    return yamlResult;
  }

  return success({
    type: config.contentType,
    metadata: yamlResult.value,
    content,
  });
};

const resolveJsonContent = async <Type extends string, MetaData>(
  markdownFilePath: string,
  config: ContentResolverConfig<Type, MetaData>,
): Promise<
  Result<ResolvedContent<Type, MetaData>, ResolveContentFailureReason>
> => {
  const sourceFileTextResult = await loadSourceText(markdownFilePath);
  if (!sourceFileTextResult.success) {
    return sourceFileTextResult;
  }

  const jsonFilePath = markdownFilePath.replace(
    /\.md$/,
    config.filePatterns.jsonSuffix,
  );

  const canAccessJson = await canAccess(jsonFilePath);
  if (!canAccessJson) {
    return failure(
      "json file not found",
      new Error(`Corresponding JSON file not found: ${jsonFilePath}`),
    );
  }

  const metadataResult = await readJsonFile(jsonFilePath, config.validator);
  if (!metadataResult.success) {
    return metadataResult;
  }

  return success({
    type: config.contentType,
    metadata: metadataResult.value,
    content: sourceFileTextResult.value,
  });
};

/**
 * Resolves content from a markdown file using type-safe configuration mapping.
 *
 * This function automatically detects the content type based on file patterns
 * and routes to the appropriate resolver with proper metadata validation.
 *
 * @template Type - Union of supported content type identifiers
 * @template ContentMetaDataMap - Mapping of content types to their metadata interfaces
 * @param markdownFilePath - Path to the markdown file to resolve
 * @param configMap - Configuration mapping for all supported content types
 * @returns Promise resolving to typed content with metadata, or failure reason
 *
 * @example
 * ```typescript
 * const result = await resolveContent("./post.md", contentResolverConfig);
 * if (result.success && result.value.type === "post") {
 *   // TypeScript knows this is PostMetaFileData
 *   console.log(result.value.metadata.title);
 * }
 * ```
 */
export const resolveContent = async <
  Type extends string,
  ContentMetaDataMap extends { [type in Type]: unknown },
>(
  markdownFilePath: string,
  configMap: ContentResolverConfigMap<Type, ContentMetaDataMap>,
): Promise<
  Result<
    ResolvedContent<Type, ContentMetaDataMap[Type]>,
    ResolveContentFailureReason
  >
> => {
  // Find matching config based on file pattern
  const configs = Object.values(configMap) as ContentResolverConfig<
    Type,
    ContentMetaDataMap[Type]
  >[];
  for (const config of configs) {
    // Check frontmatter patterns
    for (const pattern of config.filePatterns.frontmatter) {
      if (markdownFilePath.endsWith(pattern)) {
        return resolveFrontmatterContent(markdownFilePath, config);
      }
    }

    // Check JSON metadata patterns
    for (const pattern of config.filePatterns.jsonMetadata) {
      if (markdownFilePath.endsWith(pattern)) {
        return resolveJsonContent(markdownFilePath, config);
      }
    }
  }

  return failure(
    "unsupported file extension",
    new Error(`No content resolver configured for file: ${markdownFilePath}`),
  );
};
