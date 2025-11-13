import type { Result } from "@jaybeeuu/utilities";
import { failure, success, joinUrlPath } from "@jaybeeuu/utilities";
import path from "node:path";
import {
  resolveContent,
  type ResolvedContent,
  type ContentResolverConfigMap,
} from "./content-resolver.js";
import { compileMarkdown } from "./markdown-compilation.js";
import { copyFile, writeTextFile } from "../../files/index.js";
import type {
  AnyResolvedContentDefinition,
  ResolvedContentDefinition,
  ContentTypeDefinition,
} from "../content-types.js";
import { getSha1Hex } from "../../hash.js";
import { detectContentChange } from "./manifest/v1-upgrade-utils.js";

export interface BaseManifestEntry {
  fileName: string;
  href: string;
  lastUpdateDate: string;
  publishDate: string;
  hash: string;
  slug: string;
}

export interface OldManifestEntry {
  fileName?: string;
  hash?: string; // Present in V2, may be missing in legacy V1 entries
  publishDate?: string | Date;
  lastUpdateDate?: string | Date | null;
  [key: string]: unknown;
}

export type OldManifest = { [slug: string]: OldManifestEntry };

export interface ProcessedContent<
  Type extends string,
  Metadata extends { [key: string]: unknown } = { [key: string]: unknown },
  CalculatedMetadata extends { [key: string]: unknown } = {
    [key: string]: unknown;
  },
> {
  slug: string;
  contentType: Type;
  metadata: Metadata;
  compiledHtml: string;
  assets: Array<{
    sourcePath: string;
    destinationPath: string;
  }>;
  contentHash: string;
  manifestEntry: BaseManifestEntry & Metadata & CalculatedMetadata;
}

async function processTypedContent<
  Type extends string,
  Metadata extends { [key: string]: unknown },
  CalculatedMetadata extends { [key: string]: unknown },
>(
  resolvedContent: ResolvedContent<Type, Metadata>,
  filePath: string,
  oldManifest: OldManifest,
  contentConfig: ResolvedContentDefinition<
    ContentTypeDefinition<Type, Metadata, CalculatedMetadata>
  >,
): Promise<
  Result<
    ProcessedContent<Type, Metadata, CalculatedMetadata>,
    "content skipped" | "compilation failed"
  >
> {
  const { type: contentType, metadata, content } = resolvedContent;

  const metadataWithPublish = metadata as unknown as { publish?: boolean };
  if (
    "publish" in metadataWithPublish &&
    typeof metadataWithPublish.publish === "boolean" &&
    !metadataWithPublish.publish &&
    !contentConfig.includeUnpublished
  ) {
    return failure("content skipped", "Content is not published");
  }

  const slug = contentConfig.generateSlug(filePath, contentConfig.sourceDir);

  const compileResult = await compileContent(filePath, content, contentConfig);
  if (!compileResult.success) {
    return failure(
      "compilation failed",
      `Failed to compile ${String(contentType)}: ${compileResult.message}`,
    );
  }

  const { html: compiledHtml, assets } = compileResult.value;

  const contentHash = generateHash(content + JSON.stringify(metadata));

  const manifestEntry = generateTypedManifestEntry(
    slug,
    metadata,
    content,
    compiledHtml,
    contentHash,
    oldManifest,
    contentConfig,
  );

  await writeTypedCompiledContent(slug, compiledHtml, assets, contentConfig);

  return success({
    slug,
    contentType: contentType,
    metadata,
    compiledHtml,
    assets,
    contentHash,
    manifestEntry,
  });
}

export async function processFile<
  Type extends string,
  Metadata extends { [key: string]: unknown },
  CalculatedMetadata extends { [key: string]: unknown },
>(
  filePath: string,
  oldManifest: OldManifest,
  contentConfig: ResolvedContentDefinition<
    ContentTypeDefinition<Type, Metadata, CalculatedMetadata>
  >,
): Promise<
  Result<
    ProcessedContent<Type, Metadata, CalculatedMetadata> | null,
    | "content resolution failed"
    | "content type not configured"
    | "content skipped"
    | "compilation failed"
    | "file processing failed"
  >
> {
  try {
    const contentResult = await resolveContent(filePath, {
      [contentConfig.contentType]: contentConfig,
    } as unknown as ContentResolverConfigMap<
      string,
      { [type: string]: { [key: string]: unknown } }
    >);
    if (!contentResult.success) {
      // Skip files with no metadata
      if (
        contentResult.reason === "no frontmatter in markdown file" ||
        contentResult.reason === "json file not found"
      ) {
        return success(null);
      }
      return failure(
        "content resolution failed",
        `${contentResult.reason}: ${contentResult.message}`,
      );
    }

    if (contentResult.value.type !== contentConfig.contentType) {
      return failure(
        "content type not configured",
        `No configuration found for content type: ${contentResult.value.type}`,
      );
    }

    const result = await processTypedContent(
      contentResult.value as ResolvedContent<Type, Metadata>,
      filePath,
      oldManifest,
      contentConfig,
    );
    if (!result.success) {
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

async function compileContent<
  Type extends string,
  Metadata extends { [key: string]: unknown },
  CalculatedMetadata extends { [key: string]: unknown },
>(
  filePath: string,
  content: string,
  contentConfig: ResolvedContentDefinition<
    ContentTypeDefinition<Type, Metadata, CalculatedMetadata>
  >,
): Promise<
  Result<
    {
      html: string;
      assets: Array<{ sourcePath: string; destinationPath: string }>;
    },
    "compilation failed"
  >
> {
  const result = await compileMarkdown({
    sourceFilePath: filePath,
    sourceFileText: content,
    hrefRoot: contentConfig.hrefRoot,
    codeLineNumbers: contentConfig.codeLineNumbers,
    removeH1: contentConfig.removeH1,
  });

  if (!result.success) {
    return failure("compilation failed", result.message);
  }

  return success(result.value);
}

function generateTypedManifestEntry<
  Type extends string,
  Metadata extends { [key: string]: unknown },
  CalculatedMetadata extends { [key: string]: unknown },
>(
  slug: string,
  metadata: Metadata,
  content: string,
  compiledHtml: string,
  contentHash: string,
  oldManifest: OldManifest,
  contentConfig: ResolvedContentDefinition<
    ContentTypeDefinition<Type, Metadata, CalculatedMetadata>
  >,
): BaseManifestEntry & Metadata & CalculatedMetadata {
  const fileName = contentConfig.generateFileName(slug, compiledHtml);
  const href = joinUrlPath(contentConfig.hrefRoot, fileName);

  const oldEntryRaw = oldManifest[slug];
  const oldEntry = isValidOldEntry(oldEntryRaw) ? oldEntryRaw : undefined;

  const publishDate = new Date(
    oldEntry?.publishDate ?? new Date(),
  ).toISOString();

  const hasBeenUpdated = detectContentChange(
    oldEntry,
    fileName,
    contentHash,
    slug,
  );

  // For new posts (no oldEntry), lastUpdateDate should be null
  // For existing posts that have been updated, set to current date
  // For existing posts that haven't been updated, preserve existing lastUpdateDate or null
  const lastUpdateDate = !oldEntry
    ? null // New post, no update date
    : hasBeenUpdated
      ? new Date().toISOString() // Content changed, set current time
      : oldEntry.lastUpdateDate
        ? new Date(oldEntry.lastUpdateDate).toISOString() // Preserve existing update date
        : null; // Old post with no previous update date

  const enhancedMetadata = contentConfig.getAdditionalMetadata(
    metadata,
    content,
  );

  return {
    ...metadata,
    ...enhancedMetadata,
    fileName,
    href,
    publishDate,
    lastUpdateDate,
    hash: contentHash,
    slug,
  } as BaseManifestEntry & Metadata & CalculatedMetadata;
}

async function writeTypedCompiledContent<
  Type extends string,
  Metadata extends { [key: string]: unknown },
  CalculatedMetadata extends { [key: string]: unknown },
>(
  slug: string,
  html: string,
  assets: Array<{ sourcePath: string; destinationPath: string }>,
  contentConfig: ResolvedContentDefinition<
    ContentTypeDefinition<Type, Metadata, CalculatedMetadata>
  >,
): Promise<void> {
  const htmlFileName = contentConfig.generateFileName(slug, html);
  const htmlPath = path.join(contentConfig.outputDir, htmlFileName);
  await writeTextFile(htmlPath, html);

  await Promise.all(
    assets.map((asset) =>
      copyFile(
        asset.sourcePath,
        path.join(contentConfig.outputDir, asset.destinationPath),
      ),
    ),
  );
}

function isValidOldEntry(entry: unknown): entry is OldManifestEntry {
  return typeof entry === "object" && entry !== null;
}

function generateHash(content: string): string {
  return getSha1Hex(content);
}
