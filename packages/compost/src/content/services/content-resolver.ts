import type { Result } from "@jaybeeuu/utilities";
import { failure, repackError, success } from "@jaybeeuu/utilities";
import type { ReadJsonFileFailureReason } from "../../files/index.js";
import { canAccess, readJsonFile, readTextFile } from "../../files/index.js";
import type { ParseYamlMetaFailureReason } from "./metadata.js";
import { parseYamlMeta } from "./metadata.js";
import { is, isIntersectionOf } from "@jaybeeuu/is";
import type { BaseInputMetadata } from "../content-definition.js";
import {
  type ContentDefinition,
  type ContentDefInputMeta,
  type ContentDefType,
  isBaseInputMetadata,
} from "../content-definition.js";

/**
 * The result of successfully resolving content from a markdown file.
 *
 * Contains the parsed content, validated metadata, and identified content type.
 *
 * @template Type - The content type identifier
 * @template Metadata - The metadata interface for this content type
 */
export type ResolvedContent<Type extends string, Metadata> = {
  /** The identified content type */
  type: Type;

  /** The raw metadata (validation happens later in the processing pipeline) */
  metadata: Metadata & BaseInputMetadata;

  /** The markdown content (without frontmatter) */
  content: string;
};

export type LoadSourceFailureReason = "load source failure";
export type NoFrontMatterFailureReason = "no frontmatter in markdown file";
export type ValidateFrontmatterMetaFailureReason =
  "invalid frontmatter metadata";
export type ValidateJsonMetaFailureReason = "invalid json metadata";
export type JsonFileNotFoundReason = "json file not found";
export type UnsupportedFileExtensionReason = "unsupported file extension";
export type ContentTypeNotConfiguredReason = "content type not configured";

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

export type ContentDefResolvedContent<ContentDef extends ContentDefinition> = {
  /** The identified content type */
  type: ContentDefType<ContentDef>;
  /** The raw metadata (validation happens later in the processing pipeline) */
  metadata: ContentDefInputMeta<ContentDef>;
  /** The markdown content (without frontmatter) */
  content: string;
};

export type ResolveFrontmatterContentFailureReason =
  | LoadSourceFailureReason
  | JsonFileNotFoundReason
  | ReadJsonFileFailureReason
  | NoFrontMatterFailureReason
  | ValidateFrontmatterMetaFailureReason
  | ParseYamlMetaFailureReason;

const resolveFrontmatterContent = async <ContentDef extends ContentDefinition>(
  markdownFilePath: string,
  pattern: string,
  config: ContentDef,
): Promise<
  Result<
    ContentDefResolvedContent<ContentDef>,
    ResolveFrontmatterContentFailureReason
  >
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

  const yamlResult = parseYamlMeta(
    frontMatterText,
    isIntersectionOf(is(config.validateInputMeta), isBaseInputMetadata),
  );
  if (!yamlResult.success) {
    return repackError(
      yamlResult,
      "invalid frontmatter metadata",
      "Failed to parse frontmatter metadata",
    );
  }

  return success({
    type: config.contentType as ContentDefType<ContentDef>,
    metadata: yamlResult.value as unknown as ContentDefInputMeta<ContentDef>,
    content,
  });
};

export type ResolveJsonContentFailureReason =
  | LoadSourceFailureReason
  | JsonFileNotFoundReason
  | ReadJsonFileFailureReason
  | ValidateJsonMetaFailureReason;

const resolveJsonContent = async <ContentDef extends ContentDefinition>(
  markdownFilePath: string,
  pattern: string,
  config: ContentDef,
): Promise<
  Result<ContentDefResolvedContent<ContentDef>, ResolveJsonContentFailureReason>
> => {
  const sourceFileTextResult = await loadSourceText(markdownFilePath);
  if (!sourceFileTextResult.success) {
    return sourceFileTextResult;
  }

  const jsonFilePath = markdownFilePath.replace(
    pattern,
    config.filePatterns.jsonFileExt,
  );
  const canAccessJson = await canAccess(jsonFilePath);

  if (!canAccessJson) {
    return failure(
      "json file not found",
      new Error(`Corresponding JSON file not found: ${jsonFilePath}`),
    );
  }

  const metadataResult = await readJsonFile(
    jsonFilePath,
    isIntersectionOf(is(config.validateInputMeta), isBaseInputMetadata),
  );
  if (!metadataResult.success) {
    return repackError(
      metadataResult,
      "invalid json metadata",
      "Failed to load JSON Metadata",
    );
  }

  return success({
    type: config.contentType as ContentDefType<ContentDef>,
    metadata:
      metadataResult.value as unknown as ContentDefInputMeta<ContentDef>,
    content: sourceFileTextResult.value,
  });
};

export type ResolveContentFailureReason =
  | ResolveFrontmatterContentFailureReason
  | ResolveJsonContentFailureReason
  | UnsupportedFileExtensionReason;

/**
 * Resolves content from a markdown file using a single content type configuration.
 *
 * This function detects whether to use frontmatter or JSON metadata based on
 * file patterns and validates the metadata according to the content type.
 *
 * @template Type - The content type identifier
 * @template Metadata - The metadata interface for this content type
 * @template CalculatedMetadata - Additional metadata calculated from content
 * @param markdownFilePath - Path to the markdown file to resolve
 * @param config - Configuration for the specific content type
 * @returns Promise resolving to typed content with metadata, or failure reason
 */
export const resolveContent = async <Content extends ContentDefinition>(
  markdownFilePath: string,
  config: Content,
): Promise<
  Result<
    ContentDefResolvedContent<Content>,
    ResolveContentFailureReason | "invalid json metadata"
  >
> => {
  // Check frontmatter patterns
  for (const pattern of config.filePatterns.frontmatter) {
    if (markdownFilePath.endsWith(pattern)) {
      return resolveFrontmatterContent(markdownFilePath, pattern, config);
    }
  }

  // Check JSON metadata patterns
  for (const pattern of config.filePatterns.jsonMetadata) {
    if (markdownFilePath.endsWith(pattern)) {
      return resolveJsonContent(markdownFilePath, pattern, config);
    }
  }

  return failure(
    "unsupported file extension",
    new Error(`No content resolver configured for file: ${markdownFilePath}`),
  );
};
