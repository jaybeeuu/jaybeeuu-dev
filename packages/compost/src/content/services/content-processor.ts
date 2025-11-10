import type { Result } from "@jaybeeuu/utilities";
import { failure, success, joinUrlPath } from "@jaybeeuu/utilities";
import path from "node:path";
import { resolveContent, type ResolvedContent } from "./content-resolver.js";
import { compileMarkdown } from "./markdown-compilation.js";
// Note: We'll access processing functions directly from contentResolverConfig now
import { copyFile, writeTextFile } from "../../files/index.js";
import type { ContentConfig } from "../content-types.js";
import { getSha1Hex } from "../../hash.js";

/**
 * Configuration for content processing.
 */
export interface ContentProcessorConfig {
  sourceDir: string;
  outputDir: string;
  hrefRoot: string;
  includeUnpublished: boolean;
  codeLineNumbers: boolean;
  removeH1: boolean;
}

/**
 * Base manifest entry properties that all content types share.
 */
export interface BaseManifestEntry {
  fileName: string;
  href: string;
  lastUpdateDate: string | null;
  publishDate: string;
  hash: string;
  slug: string;
}

/**
 * Type for old manifest entries from previous runs.
 * Can be either V1 (legacy format) or V2 (current format from previous runs).
 * Contains at minimum the fields needed for change detection.
 */
export interface OldManifestEntry {
  fileName?: string;
  hash?: string; // Present in V2, may be missing in legacy V1 entries
  publishDate?: string | Date;
  lastUpdateDate?: string | Date | null;
  [key: string]: unknown;
}

/**
 * Type for old manifests used in change detection.
 * Maps slug to old manifest entries.
 */
export type OldManifest = { [slug: string]: OldManifestEntry };

/**
 * Represents a successfully processed content item.
 *
 * @template Type - The content type identifier (string)
 * @template ManifestEntry - The complete manifest entry type for this content type
 */
export interface ProcessedContent<
  Type extends string,
  ManifestEntry extends BaseManifestEntry = BaseManifestEntry & {
    [key: string]: unknown;
  },
> {
  /** Content slug/identifier */
  slug: string;

  /** Type of content (post, tech-radar, etc.) */
  contentType: Type;

  /** Validated metadata for this content type */
  metadata: unknown;

  /** Compiled HTML content */
  compiledHtml: string;

  /** Associated assets (images, etc.) */
  assets: Array<{
    sourcePath: string;
    destinationPath: string;
  }>;

  /** Content hash for change detection */
  contentHash: string;

  /** Final metadata for manifest - fully typed based on content type */
  manifestEntry: ManifestEntry;
}

/**
 * Context for content processing operations.
 * Contains all configuration and dependencies needed for processing.
 */
interface ProcessingContext<
  ConfigMap extends {
    [K in keyof ConfigMap]: ConfigMap[K] extends ContentConfig<
      infer Type,
      infer MetaData
    >
      ? Type extends K
        ? ContentConfig<Type, MetaData>
        : never
      : never;
  },
> {
  config: ContentProcessorConfig;
  resolverConfig: ConfigMap;
}

/**
 * Type-safe processing helper that preserves metadata types.
 *
 * @template ConfigMap - Map of content types to their ContentConfig definitions
 * @template Type - The content type
 * @template MetaData - The metadata type for this content type
 */
async function processTypedContent<
  ConfigMap extends {
    [K in keyof ConfigMap]: ConfigMap[K] extends ContentConfig<
      infer Type,
      infer MetaData
    >
      ? Type extends K
        ? ContentConfig<Type, MetaData>
        : never
      : never;
  },
  Type extends keyof ConfigMap & string,
  MetaData,
>(
  resolvedContent: ResolvedContent<Type, MetaData>,
  filePath: string,
  oldManifests: { [contentType: string]: OldManifest },
  context: ProcessingContext<ConfigMap>,
): Promise<Result<ProcessedContent<string>, string>> {
  const { type: contentType, metadata, content } = resolvedContent;

  const contentConfig = context.resolverConfig[contentType];

  // Check if we should skip unpublished content
  const metadataWithPublish = metadata as unknown as { publish?: boolean };
  if (
    "publish" in metadataWithPublish &&
    typeof metadataWithPublish.publish === "boolean" &&
    !metadataWithPublish.publish &&
    !context.config.includeUnpublished
  ) {
    return failure("content skipped", "Content is not published");
  }

  const slug = contentConfig.generateSlug(filePath, context.config.sourceDir);

  const compileResult = await compileContent(filePath, content, context);
  if (!compileResult.success) {
    return failure(
      "compilation failed",
      `Failed to compile ${String(contentType)}: ${compileResult.message}`,
    );
  }

  const { html: compiledHtml, assets } = compileResult.value;

  const contentHash = generateHash(content + JSON.stringify(metadata));

  const oldManifest = oldManifests[contentType as string] || {};

  const manifestEntry = generateTypedManifestEntry(
    slug,
    metadata,
    content,
    compiledHtml,
    contentHash,
    oldManifest,
    contentConfig,
    context,
  );

  await writeTypedCompiledContent(
    slug,
    compiledHtml,
    assets,
    contentConfig,
    context,
  );

  return success({
    slug,
    contentType: contentType as string,
    metadata,
    compiledHtml,
    assets,
    contentHash,
    manifestEntry,
  });
}

/**
 * Process a single file: resolve content + compile + hash.
 *
 * @template ConfigMap - Map of content types to their ContentConfig definitions
 * @param filePath - Path to the content file
 * @param oldManifests - All old manifests for change detection
 * @param config - Content processor configuration
 * @param resolverConfig - Content type resolver configuration
 * @returns Promise resolving to processed content or null if should be skipped
 */
export async function processFile<
  ConfigMap extends {
    [K in keyof ConfigMap]: ConfigMap[K] extends ContentConfig<
      infer Type,
      infer MetaData
    >
      ? Type extends K
        ? ContentConfig<Type, MetaData>
        : never
      : never;
  },
>(
  filePath: string,
  oldManifests: { [contentType: string]: OldManifest },
  config: ContentProcessorConfig,
  resolverConfig: ConfigMap,
): Promise<Result<ProcessedContent<string> | null, string>> {
  const context: ProcessingContext<ConfigMap> = { config, resolverConfig };

  try {
    const contentResult = await resolveContent(
      filePath,
      resolverConfig as any, // Type assertion needed due to generic constraints
    );
    if (!contentResult.success) {
      // Skip files with no metadata, but fail on actual errors (invalid YAML, etc.)
      if (
        contentResult.reason === "no frontmatter in markdown file" ||
        contentResult.reason === "json file not found"
      ) {
        return success(null); // Skip files with no metadata
      }
      return failure(
        "content resolution failed",
        `${contentResult.reason}: ${contentResult.message}`,
      );
    }

    if (!(contentResult.value.type in resolverConfig)) {
      return failure(
        "content type not configured",
        `No configuration found for content type: ${contentResult.value.type}`,
      );
    }

    // Now process with type safety preserved
    // Type assertion is safe here because we've already verified the content type exists in our config
    const result = await processTypedContent(
      contentResult.value as ResolvedContent<keyof ConfigMap & string, unknown>,
      filePath,
      oldManifests,
      context,
    );
    if (!result.success) {
      // Handle the "content skipped" case specially
      if (result.reason === "content skipped") {
        return success(null);
      }
      return result;
    }

    return success(result.value);
  } catch (error) {
    return failure(
      "file processing failed",
      `Failed to process file ${filePath}: ${String(error)}`,
    );
  }
}

/**
 * Compile content using shared markdown compilation.
 *
 * @param filePath - Source file path
 * @param content - Raw content text
 * @param context - Processing context with configuration
 * @returns Promise resolving to compiled content
 */
async function compileContent<
  ConfigMap extends {
    [K in keyof ConfigMap]: ConfigMap[K] extends ContentConfig<
      infer Type,
      infer MetaData
    >
      ? Type extends K
        ? ContentConfig<Type, MetaData>
        : never
      : never;
  },
>(
  filePath: string,
  content: string,
  context: ProcessingContext<ConfigMap>,
): Promise<
  Result<
    {
      html: string;
      assets: Array<{ sourcePath: string; destinationPath: string }>;
    },
    string
  >
> {
  return await compileMarkdown({
    sourceFilePath: filePath,
    sourceFileText: content,
    hrefRoot: context.config.hrefRoot,
    codeLineNumbers: context.config.codeLineNumbers,
    removeH1: context.config.removeH1,
  });
}

/**
 * Type-safe manifest entry generation that preserves metadata types.
 */
function generateTypedManifestEntry<
  ConfigMap extends {
    [K in keyof ConfigMap]: ConfigMap[K] extends ContentConfig<
      infer Type,
      infer MetaData
    >
      ? Type extends K
        ? ContentConfig<Type, MetaData>
        : never
      : never;
  },
  Type extends keyof ConfigMap & string,
  MetaData,
>(
  slug: string,
  metadata: MetaData,
  content: string,
  compiledHtml: string,
  contentHash: string,
  oldManifest: OldManifest,
  contentConfig: ConfigMap[Type],
  context: ProcessingContext<ConfigMap>,
): BaseManifestEntry & { [key: string]: unknown } {
  const fileName = contentConfig.generateFileName(slug, compiledHtml);
  const href = joinUrlPath(context.config.hrefRoot, fileName);

  const oldEntryRaw = oldManifest[slug];
  const oldEntry = isValidOldEntry(oldEntryRaw) ? oldEntryRaw : undefined;

  const publishDate = new Date(
    oldEntry?.publishDate ?? new Date(),
  ).toISOString();

  // Check if content has been updated using source content hash for consistency
  // For V1 upgraded entries, we can't compare hashes directly since V1 hashes are filename-based
  // We detect V1 entries by checking if the old hash could be a V1 upgrade hash
  const couldBeV1Hash =
    oldEntry?.hash && couldBeV1UpgradeHash(oldEntry.hash, fileName, slug);

  const hasBeenUpdated = oldEntry
    ? oldEntry.hash !== undefined
      ? couldBeV1Hash
        ? oldEntry.fileName !== fileName // V1 upgrade - compare filenames
        : oldEntry.hash !== contentHash // V2 native - compare hashes
      : oldEntry.fileName !== fileName
    : false;

  const lastUpdateDate = hasBeenUpdated
    ? new Date().toISOString()
    : oldEntry?.lastUpdateDate
      ? new Date(oldEntry.lastUpdateDate).toISOString()
      : null;

  const enhancedMetadata = contentConfig.enhanceMetadata(metadata, content);

  return {
    ...(metadata as { [key: string]: unknown }),
    ...enhancedMetadata,
    fileName,
    href,
    publishDate,
    lastUpdateDate,
    hash: contentHash,
    slug,
  } as BaseManifestEntry & { [key: string]: unknown };
}

/**
 * Type-safe content writing that preserves content type information.
 */
async function writeTypedCompiledContent<
  ConfigMap extends {
    [K in keyof ConfigMap]: ConfigMap[K] extends ContentConfig<
      infer Type,
      infer MetaData
    >
      ? Type extends K
        ? ContentConfig<Type, MetaData>
        : never
      : never;
  },
  Type extends keyof ConfigMap & string,
>(
  slug: string,
  html: string,
  assets: Array<{ sourcePath: string; destinationPath: string }>,
  contentConfig: ConfigMap[Type],
  context: ProcessingContext<ConfigMap>,
): Promise<void> {
  const htmlFileName = contentConfig.generateFileName(slug, html);
  const htmlPath = path.join(context.config.outputDir, htmlFileName);
  await writeTextFile(htmlPath, html);

  await Promise.all(
    assets.map((asset) =>
      copyFile(
        asset.sourcePath,
        path.join(context.config.outputDir, asset.destinationPath),
      ),
    ),
  );
}

/**
 * Type guard to validate old manifest entry structure.
 */
function isValidOldEntry(entry: unknown): entry is OldManifestEntry {
  return typeof entry === "object" && entry !== null;
}

/**
 * Generate SHA1 hash for content.
 */
function generateHash(content: string): string {
  return getSha1Hex(content);
}

/**
 * Check if a hash could have been generated by the V1 upgrade process.
 * V1 upgrade hashes are generated from filename patterns like "v1-upgrade-{hash}"
 */
function couldBeV1UpgradeHash(
  hash: string,
  fileName: string,
  slug: string,
): boolean {
  if (!hash || (hash.length !== 32 && hash.length !== 40)) return false; // Not an MD5 or SHA1 hash

  // Try to extract the original hash from the filename
  const pattern = new RegExp(`^${escapeRegExp(slug)}-(\\w+)\\.html$`);
  const match = fileName.match(pattern);

  if (match && match[1]) {
    // Check if the hash matches what would be generated from this filename part
    const expectedV1Hash = getSha1Hex(`v1-upgrade-${match[1]}`);

    if (hash === expectedV1Hash) {
      return true;
    }
  }

  // Check fallback pattern (full filename)
  const fallbackV1Hash = getSha1Hex(`v1-upgrade-${fileName}`);

  return hash === fallbackV1Hash;
}

/**
 * Escape special regex characters in string
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
