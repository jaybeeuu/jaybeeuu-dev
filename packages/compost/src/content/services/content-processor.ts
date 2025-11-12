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
import type { ContentConfig, AnyContentConfigMap } from "../content-types.js";
import { getSha1Hex } from "../../hash.js";
import { detectContentChange } from "./manifest/v1-upgrade-utils.js";

export interface ContentProcessorConfig {
  sourceDir: string;
  outputDir: string;
  hrefRoot: string;
  includeUnpublished: boolean;
  codeLineNumbers: boolean;
  removeH1: boolean;
}

export interface BaseManifestEntry {
  fileName: string;
  href: string;
  lastUpdateDate: string | null;
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
  ManifestEntry extends BaseManifestEntry = BaseManifestEntry & {
    [key: string]: unknown;
  },
> {
  slug: string;
  contentType: Type;
  metadata: unknown;
  compiledHtml: string;
  assets: Array<{
    sourcePath: string;
    destinationPath: string;
  }>;
  contentHash: string;
  manifestEntry: ManifestEntry;
}

interface ProcessingContext {
  config: ContentProcessorConfig;
  resolverConfig: AnyContentConfigMap;
}

async function processTypedContent(
  resolvedContent: ResolvedContent<string, unknown>,
  filePath: string,
  oldManifests: { [contentType: string]: OldManifest },
  context: ProcessingContext,
): Promise<Result<ProcessedContent<string>, string>> {
  const { type: contentType, metadata, content } = resolvedContent;

  const contentConfig = context.resolverConfig[contentType];
  if (!contentConfig) {
    return failure(
      "content type not supported",
      `No configuration found for content type: ${contentType}`,
    );
  }

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

export async function processFile(
  filePath: string,
  oldManifests: { [contentType: string]: OldManifest },
  config: ContentProcessorConfig,
  resolverConfig: AnyContentConfigMap,
): Promise<Result<ProcessedContent<string> | null, string>> {
  const context: ProcessingContext = { config, resolverConfig };

  try {
    const contentResult = await resolveContent(
      filePath,
      resolverConfig as ContentResolverConfigMap<
        string,
        { [type: string]: unknown }
      >,
    );
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

    if (!(contentResult.value.type in resolverConfig)) {
      return failure(
        "content type not configured",
        `No configuration found for content type: ${contentResult.value.type}`,
      );
    }

    const result = await processTypedContent(
      contentResult.value,
      filePath,
      oldManifests,
      context,
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

async function compileContent(
  filePath: string,
  content: string,
  context: ProcessingContext,
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

function generateTypedManifestEntry(
  slug: string,
  metadata: unknown,
  content: string,
  compiledHtml: string,
  contentHash: string,
  oldManifest: OldManifest,
  contentConfig: ContentConfig<string, object>,
  context: ProcessingContext,
): BaseManifestEntry & { [key: string]: unknown } {
  const fileName = contentConfig.generateFileName(slug, compiledHtml);
  const href = joinUrlPath(context.config.hrefRoot, fileName);

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

  const lastUpdateDate = hasBeenUpdated
    ? new Date().toISOString()
    : oldEntry?.lastUpdateDate
      ? new Date(oldEntry.lastUpdateDate).toISOString()
      : null;

  const enhancedMetadata = contentConfig.getAdditionalMetadata(
    metadata as object,
    content,
  );

  const typedMetadata = metadata as Record<string, unknown>;

  return {
    ...typedMetadata,
    ...enhancedMetadata,
    fileName,
    href,
    publishDate,
    lastUpdateDate,
    hash: contentHash,
    slug,
  } as BaseManifestEntry & { [key: string]: unknown };
}

async function writeTypedCompiledContent(
  slug: string,
  html: string,
  assets: Array<{ sourcePath: string; destinationPath: string }>,
  contentConfig: ContentConfig<string, object>,
  context: ProcessingContext,
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

function isValidOldEntry(entry: unknown): entry is OldManifestEntry {
  return typeof entry === "object" && entry !== null;
}

function generateHash(content: string): string {
  return getSha1Hex(content);
}
