import type { Result } from "@jaybeeuu/utilities";
import { failure, success } from "@jaybeeuu/utilities";
import type { ReadJsonFileFailureReason } from "../../files/index.js";
import { canAccess, readJsonFile, readTextFile } from "../../files/index.js";
import type { ParseYamlMetaFailureReason } from "./metadata.js";
import { parseYamlMeta } from "./metadata.js";
import { is } from "@jaybeeuu/is";
import type {
  ResolvedContentDefinition,
  ContentTypeDefinition,
  BaseInputMetadata,
} from "../content-types.js";

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
  metadata: Metadata;

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

const resolveFrontmatterContent = async <
  Type extends string,
  InputMeta extends { [key: string]: unknown },
  OutputMeta extends Record<string, unknown>,
>(
  markdownFilePath: string,
  config: ResolvedContentDefinition<
    ContentTypeDefinition<Type, InputMeta, OutputMeta>
  >,
): Promise<
  Result<ResolvedContent<Type, unknown>, ResolveContentFailureReason>
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

  const yamlResult = parseYamlMeta(frontMatterText, is("object"));
  if (!yamlResult.success) {
    return yamlResult;
  }

  return success({
    type: config.contentType,
    metadata: yamlResult.value,
    content,
  });
};

const resolveJsonContent = async <
  Type extends string,
  InputMeta extends { [key: string]: unknown },
  OutputMeta extends Record<string, unknown>,
>(
  markdownFilePath: string,
  config: ResolvedContentDefinition<
    ContentTypeDefinition<Type, InputMeta, OutputMeta>
  >,
): Promise<
  Result<ResolvedContent<Type, unknown>, ResolveContentFailureReason>
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

  const metadataResult = await readJsonFile(jsonFilePath, is("object"));
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
export const resolveContent = async <
  Type extends string,
  InputMeta extends { [key: string]: unknown },
  OutputMeta extends Record<string, unknown>,
>(
  markdownFilePath: string,
  config: ResolvedContentDefinition<
    ContentTypeDefinition<Type, InputMeta, OutputMeta>
  >,
): Promise<
  Result<ResolvedContent<Type, unknown>, ResolveContentFailureReason>
> => {
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

  return failure(
    "unsupported file extension",
    new Error(`No content resolver configured for file: ${markdownFilePath}`),
  );
};
