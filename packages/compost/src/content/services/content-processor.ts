import type { Result } from "@jaybeeuu/utilities";
import { failure, success, joinUrlPath } from "@jaybeeuu/utilities";
import path from "node:path";
import { resolveContent } from "./content-resolver.js";
import { compileMarkdown } from "./markdown-compilation.js";
import { copyFile, writeTextFile } from "../../files/index.js";
import type {
  ContentTypeDefinition,
  BaseInputMetadata,
  ContentDefType,
  ContentDefInputMeta,
  CustomManifestEntryProperties,
  ContentDefManifestEntry,
} from "../content-types.js";
import { isBaseInputMetadata } from "../content-types.js";
import { getSha1Hex } from "../../hash.js";
import { shouldTreatEntryAsChanged } from "./manifest/index.js";

export interface OldManifestEntry {
  fileName?: string;
  hash?: string; // Present in V2, may be missing in legacy V1 entries
  publishDate?: string | Date;
  lastUpdateDate?: string | Date | null;
  [key: string]: unknown;
}

export type OldManifest = { [slug: string]: OldManifestEntry };

export interface ProcessedContent<ContentDef extends ContentTypeDefinition> {
  slug: string;
  contentType: ContentDefType<ContentDef>;
  inputMetadata: ContentDefInputMeta<ContentDef> & BaseInputMetadata;
  compiledHtml: string;
  assets: Array<{
    sourcePath: string;
    destinationPath: string;
  }>;
  contentHash: string;
  manifestEntry: ContentDefManifestEntry<ContentDef>;
}

export type ProcessTypedContentFailureReason =
  | "content skipped"
  | "compilation failed";

async function processTypedContent<ContentDef extends ContentTypeDefinition>(
  inputMetadata: ContentDefInputMeta<ContentDef> & BaseInputMetadata,
  content: string,
  filePath: string,
  oldManifest: OldManifest,
  contentDef: ContentDef,
): Promise<
  Result<ProcessedContent<ContentDef>, ProcessTypedContentFailureReason>
> {
  // Check if content should be published (filtering based on input metadata)
  if (!inputMetadata.publish && !contentDef.includeUnpublished) {
    return failure("content skipped", "Content is not published");
  }

  const slug = contentDef.generateSlug(filePath, contentDef.sourceDir);

  const compileResult = await compileContent(filePath, content, contentDef);
  if (!compileResult.success) {
    return failure(
      "compilation failed",
      `Failed to compile ${contentDef.contentType}: ${compileResult.message}`,
    );
  }

  const { html: compiledHtml, assets } = compileResult.value;

  const customManifestEntryProperties = contentDef.mapToManifestEntry(
    inputMetadata,
    content,
  ) as CustomManifestEntryProperties<ContentDef>;

  const contentHash = generateHash(content + JSON.stringify(inputMetadata));

  const manifestEntry: ContentDefManifestEntry<ContentDef> =
    generateManifestEntry(
      slug,
      customManifestEntryProperties,
      compiledHtml,
      contentHash,
      oldManifest,
      contentDef,
    );

  await writeTypedCompiledContent(slug, compiledHtml, assets, contentDef);

  return success({
    slug,
    contentType: contentDef.contentType as ContentDefType<ContentDef>,
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

export const processFile = async <ContentDef extends ContentTypeDefinition>(
  filePath: string,
  oldManifest: OldManifest,
  contentDef: ContentDef,
): Promise<
  Result<ProcessedContent<ContentDef> | null, ProcessFileFailureReason>
> => {
  try {
    const contentResult = await resolveContent(filePath, contentDef);
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

    if (contentResult.value.type !== contentDef.contentType) {
      return failure(
        "content type not configured",
        `No configuration found for content type: ${contentResult.value.type}`,
      );
    }

    // Validate input metadata: both user-defined and base metadata must be valid
    if (
      !contentDef.validateInputMeta(contentResult.value.metadata) ||
      !isBaseInputMetadata(contentResult.value.metadata)
    ) {
      return failure("content resolution failed", "Invalid metadata structure");
    }

    const result = await processTypedContent(
      contentResult.value.metadata,
      contentResult.value.content,
      filePath,
      oldManifest,
      contentDef,
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
};

export type CompileContentFailureReason = "compilation failed";

async function compileContent(
  filePath: string,
  content: string,
  contentDef: ContentTypeDefinition,
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
    hrefRoot: contentDef.hrefRoot,
    codeLineNumbers: contentDef.codeLineNumbers,
    removeH1: contentDef.removeH1,
  });

  if (!result.success) {
    return failure("compilation failed", result.message);
  }

  return success(result.value);
}

function generateManifestEntry<ContentDef extends ContentTypeDefinition>(
  slug: string,
  customManifestEntryProperties: CustomManifestEntryProperties<ContentDef>,
  compiledHtml: string,
  contentHash: string,
  oldManifest: OldManifest,
  contentDef: ContentDef,
): ContentDefManifestEntry<ContentDef> {
  const fileName = contentDef.generateFileName(slug, compiledHtml);
  const href = joinUrlPath(contentDef.hrefRoot, fileName);

  const oldEntryRaw = oldManifest[slug];
  const oldEntry = isValidOldEntry(oldEntryRaw) ? oldEntryRaw : undefined;

  const publishDate = new Date(
    oldEntry?.publishDate ?? new Date(),
  ).toISOString();

  const hasBeenUpdated = shouldTreatEntryAsChanged(
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

  return Object.assign({}, customManifestEntryProperties, {
    fileName,
    href,
    publishDate,
    lastUpdateDate,
    hash: contentHash,
    slug,
  });
}

async function writeTypedCompiledContent(
  slug: string,
  html: string,
  assets: Array<{ sourcePath: string; destinationPath: string }>,
  contentDef: ContentTypeDefinition,
): Promise<void> {
  const htmlFileName = contentDef.generateFileName(slug, html);
  const htmlPath = path.join(contentDef.outputDir, htmlFileName);
  await writeTextFile(htmlPath, html);

  await Promise.all(
    assets.map((asset) =>
      copyFile(
        asset.sourcePath,
        path.join(contentDef.outputDir, asset.destinationPath),
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
