import type { Result } from "@jaybeeuu/utilities";
import { failure, success, joinUrlPath } from "@jaybeeuu/utilities";
import path from "node:path";
import { resolveContent } from "./content-resolver.js";
import { compileMarkdown } from "./markdown-compilation.js";
import { copyFile, writeTextFile } from "../../files/index.js";
import type {
  ResolvedContentDefinition,
  ContentTypeDefinition,
  BaseInputMeta,
  ContentDefType,
  ContentDefInputMeta,
  ContentDefOutputMeta,
} from "../content-types.js";
import { isBaseInputMetadata } from "../content-types.js";
import { getSha1Hex } from "../../hash.js";
import { detectContentChange } from "./manifest/v1-upgrade-utils.js";
import type { BaseOutputMeta } from "./manifest/index.js";

export interface OldManifestEntry {
  fileName?: string;
  hash?: string; // Present in V2, may be missing in legacy V1 entries
  publishDate?: string | Date;
  lastUpdateDate?: string | Date | null;
  [key: string]: unknown;
}

export type OldManifest = { [slug: string]: OldManifestEntry };

export interface ProcessedContent<Content extends ContentTypeDefinition> {
  slug: string;
  contentType: ContentDefType<Content>;
  inputMetadata: ContentDefInputMeta<Content> & BaseInputMeta;
  compiledHtml: string;
  assets: Array<{
    sourcePath: string;
    destinationPath: string;
  }>;
  contentHash: string;
  manifestEntry: ContentDefOutputMeta<Content> & BaseOutputMeta;
}

export type ProcessTypedContentFailureReason =
  | "content skipped"
  | "compilation failed";

async function processTypedContent<Content extends ContentTypeDefinition>(
  inputMetadata: ContentDefInputMeta<Content> & BaseInputMeta,
  content: string,
  filePath: string,
  oldManifest: OldManifest,
  contentConfig: ResolvedContentDefinition<Content>,
): Promise<
  Result<ProcessedContent<Content>, ProcessTypedContentFailureReason>
> {
  // Check if content should be published (filtering based on input metadata)
  if (!inputMetadata.publish && !contentConfig.includeUnpublished) {
    return failure("content skipped", "Content is not published");
  }

  const slug = contentConfig.generateSlug(filePath, contentConfig.sourceDir);

  const compileResult = await compileContent(filePath, content, contentConfig);
  if (!compileResult.success) {
    return failure(
      "compilation failed",
      `Failed to compile ${contentConfig.contentType}: ${compileResult.message}`,
    );
  }

  const { html: compiledHtml, assets } = compileResult.value;

  // Map input metadata to output metadata using the mapping function
  const outputMetadata = contentConfig.mapToOutputMeta(
    inputMetadata,
    content,
  ) as ContentDefOutputMeta<Content>;

  const contentHash = generateHash(content + JSON.stringify(inputMetadata));

  const manifestEntry = generateTypedManifestEntry(
    slug,
    outputMetadata,
    compiledHtml,
    contentHash,
    oldManifest,
    contentConfig,
  );

  await writeTypedCompiledContent(slug, compiledHtml, assets, contentConfig);

  return success({
    slug,
    contentType: contentConfig.contentType as ContentDefType<Content>,
    inputMetadata,
    compiledHtml,
    assets,
    contentHash,
    manifestEntry,
  });
}

export type ProcessFileFailureReason =
  | "content resolution failed"
  | "content type not configured"
  | "content skipped"
  | "compilation failed"
  | "file processing failed";

export async function processFile<Content extends ContentTypeDefinition>(
  filePath: string,
  oldManifest: OldManifest,
  contentConfig: ResolvedContentDefinition<Content>,
): Promise<Result<ProcessedContent<Content> | null, ProcessFileFailureReason>> {
  try {
    const contentResult = await resolveContent(filePath, contentConfig);
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

    // Validate input metadata: both user-defined and base metadata must be valid
    if (
      !contentConfig.validateInputMeta(contentResult.value.metadata) ||
      !isBaseInputMetadata(contentResult.value.metadata)
    ) {
      return failure("content resolution failed", "Invalid metadata structure");
    }

    const result = await processTypedContent(
      contentResult.value.metadata,
      contentResult.value.content,
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

export type CompileContentFailureReason = "compilation failed";

async function compileContent<Content extends ContentTypeDefinition>(
  filePath: string,
  content: string,
  contentConfig: ResolvedContentDefinition<Content>,
): Promise<
  Result<
    {
      html: string;
      assets: Array<{ sourcePath: string; destinationPath: string }>;
    },
    CompileContentFailureReason
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

function generateTypedManifestEntry<Content extends ContentTypeDefinition>(
  slug: string,
  outputMetadata: ContentDefOutputMeta<Content>,
  compiledHtml: string,
  contentHash: string,
  oldManifest: OldManifest,
  contentConfig: ResolvedContentDefinition<Content>,
): BaseOutputMeta & ContentDefOutputMeta<Content> {
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

  return Object.assign({}, outputMetadata, {
    fileName,
    href,
    publishDate,
    lastUpdateDate,
    hash: contentHash,
    slug,
  });
}

async function writeTypedCompiledContent<Content extends ContentTypeDefinition>(
  slug: string,
  html: string,
  assets: Array<{ sourcePath: string; destinationPath: string }>,
  contentConfig: ResolvedContentDefinition<Content>,
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
