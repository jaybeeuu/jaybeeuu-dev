import type { Result } from "@jaybeeuu/utilities";
import { failure, joinUrlPath, success } from "@jaybeeuu/utilities";
import crypto from "crypto";
import path from "path";
import getReadingTime from "reading-time";
import { resolveContent } from "./content-resolver.js";
import { contentResolverConfig } from "./resolver-config.js";
import type { ContentMetaDataMap, ContentType } from "./content-types.js";
import { compilePost } from "./compile.js";
import { getCompiledPostFileName } from "./file-paths.js";
import { getOldManifest } from "./old-manifest.js";
import {
  deleteDirectories,
  writeJsonFile,
  writeTextFile,
  copyFile,
  recurseDirectory,
} from "../files/index.js";

/**
 * Represents a successfully processed content item ready for manifest inclusion.
 */
export interface ProcessedContent {
  /** Content slug/identifier */
  slug: string;

  /** Type of content (post, tech-radar, etc.) */
  contentType: ContentType;

  /** Validated metadata for this content type */
  metadata: ContentMetaDataMap[ContentType];

  /** Compiled HTML content */
  compiledHtml: string;

  /** Associated assets (images, etc.) */
  assets: Array<{
    sourcePath: string;
    destinationPath: string;
  }>;

  /** Content hash for change detection */
  hash: string;

  /** Final metadata for manifest */
  manifestEntry: {
    fileName: string;
    href: string;
    lastUpdateDate: string | null;
    publishDate: string;
  } & { [key: string]: unknown };
}

/**
 * Maps content types to their manifest structures.
 */
export interface ManifestMap {
  [contentType: string]: { [slug: string]: unknown };
}

/**
 * Configuration for the content orchestrator.
 */
export interface OrchestratorConfig {
  sourceDir: string;
  outputDir: string;
  hrefRoot: string;
  includeUnpublished: boolean;
  codeLineNumbers: boolean;
  removeH1: boolean;
  clean: boolean;
  manifestFileName: string;
  oldManifestLocators: string[];
  requireOldManifest: boolean;
}

/**
 * Streamlined content processing orchestrator.
 *
 * Follows the workflow: load manifests -> find files -> process individually -> update manifests
 * Designed for future child process separation.
 */
export class ContentOrchestrator {
  private config: OrchestratorConfig;
  private oldManifests: ManifestMap = {};
  private newManifests: ManifestMap = {};

  constructor(config: OrchestratorConfig) {
    this.config = config;
  }

  /**
   * Load all existing manifests for change detection.
   */
  async loadManifests(): Promise<Result<void, string>> {
    try {
      // Load manifests for each content type
      for (const contentType of Object.keys(contentResolverConfig)) {
        const manifestFileName = `${contentType}-manifest.json`;
        const manifestPath = path.resolve(
          this.config.outputDir,
          manifestFileName,
        );

        // For backward compatibility, also try the old manifest filename for posts
        const oldManifestLocators = [...this.config.oldManifestLocators];
        if (contentType === "post") {
          const oldManifestPath = path.resolve(
            this.config.outputDir,
            this.config.manifestFileName,
          );
          oldManifestLocators.unshift(oldManifestPath);
        }

        const result = await getOldManifest(manifestPath, oldManifestLocators);

        if (result.success) {
          // Handle both versioned (v2+) and legacy (v1) manifest formats
          const manifestData = result.value;
          if (
            typeof manifestData === "object" &&
            manifestData !== null &&
            "version" in manifestData &&
            "entries" in manifestData
          ) {
            // New versioned format
            this.oldManifests[contentType] = (manifestData as any).entries;
          } else {
            // Legacy format - direct object
            this.oldManifests[contentType] = manifestData;
          }
        } else if (this.config.requireOldManifest) {
          return failure(
            "manifest load failed",
            `Failed to load required manifest for ${contentType}: ${result.message}`,
          );
        } else {
          this.oldManifests[contentType] = {};
        }

        // Initialize new manifest
        this.newManifests[contentType] = {};
      }

      return success();
    } catch (error) {
      return failure(
        "manifest load failed",
        `Failed to load manifests: ${String(error)}`,
      );
    }
  }

  /**
   * Find all content files using glob patterns.
   */
  async findFiles(): Promise<Result<string[], string>> {
    try {
      const patterns: string[] = [];

      // Collect all file patterns from content resolver config
      for (const config of Object.values(contentResolverConfig)) {
        patterns.push(...config.filePatterns.frontmatter);
        patterns.push(...config.filePatterns.jsonMetadata);
      }

      // Convert patterns to RegExp for the recurseDirectory function
      const includePatterns = patterns.map(
        (pattern) => new RegExp(`\\${pattern}$`),
      );

      // Use the existing recurseDirectory function
      const allFiles: string[] = [];

      try {
        for await (const fileInfo of recurseDirectory(this.config.sourceDir, {
          include: includePatterns,
        })) {
          allFiles.push(fileInfo.filePath);
        }
      } catch (error) {
        // If source directory doesn't exist, return empty array
        return success([]);
      }

      return success(allFiles);
    } catch (error) {
      return failure(
        "file discovery failed",
        `Failed to find files: ${String(error)}`,
      );
    }
  }

  /**
   * Process a single file: resolve content + compile + hash.
   * Future: This function can be moved to a child process.
   */
  async processFile(
    filePath: string,
  ): Promise<Result<ProcessedContent | null, string>> {
    try {
      // Resolve content using the generic resolver
      const contentResult = await resolveContent(
        filePath,
        contentResolverConfig,
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

      const { type: contentType, metadata, content } = contentResult.value;

      // Check if we should skip unpublished content
      if (
        "publish" in metadata &&
        !metadata.publish &&
        !this.config.includeUnpublished
      ) {
        return success(null);
      }

      // Generate slug from file path
      const slug = this.generateSlug(filePath);

      // Compile content (currently only posts supported, tech radar will be added)
      const compileResult = await this.compileContent(
        filePath,
        content,
        contentType,
      );
      if (!compileResult.success) {
        return failure(
          "compilation failed",
          `Failed to compile ${contentType}: ${compileResult.message}`,
        );
      }

      const { html: compiledHtml, assets } = compileResult.value;

      // Generate content hash for change detection
      const hash = this.generateHash(content + JSON.stringify(metadata));

      // Generate manifest entry
      const manifestEntry = this.generateManifestEntry(
        slug,
        contentType,
        metadata,
        content,
        compiledHtml,
        hash,
      );

      // Write compiled content and assets
      await this.writeCompiledContent(slug, contentType, compiledHtml, assets);

      return success({
        slug,
        contentType,
        metadata,
        compiledHtml,
        assets,
        hash,
        manifestEntry,
      });
    } catch (error) {
      return failure(
        "file processing failed",
        `Failed to process file ${filePath}: ${String(error)}`,
      );
    }
  }

  /**
   * Update all manifests with processed content.
   */
  async updateManifests(
    processedContent: ProcessedContent[],
  ): Promise<Result<void, string>> {
    try {
      // Group content by type
      for (const content of processedContent) {
        if (!this.newManifests[content.contentType]) {
          this.newManifests[content.contentType] = {};
        }
        this.newManifests[content.contentType]![content.slug] =
          content.manifestEntry;
      }

      // Write all manifests with version information
      for (const [contentType, manifest] of Object.entries(this.newManifests)) {
        const manifestFileName = `${contentType}-manifest.json`;
        const manifestPath = path.resolve(
          this.config.outputDir,
          manifestFileName,
        );

        // Calculate overall hash from all entries
        const entriesHash = this.generateHash(
          JSON.stringify(manifest, Object.keys(manifest).sort()),
        );

        // Add version and metadata to the manifest
        const versionedManifest = {
          version: 2, // Version 2 includes content hashes for change detection
          metadata: {
            generatedAt: new Date().toISOString(),
            entryCount: Object.keys(manifest).length,
            overallHash: entriesHash,
          },
          entries: manifest,
        };

        await writeJsonFile(manifestPath, versionedManifest);
      }

      return success();
    } catch (error) {
      return failure(
        "manifest update failed",
        `Failed to update manifests: ${String(error)}`,
      );
    }
  }

  /**
   * Get the final manifests (for returning to caller).
   */
  getManifests(): ManifestMap {
    // Return just the entries for backward compatibility with existing code
    return this.newManifests;
  }

  // Private helper methods

  private generateSlug(filePath: string): string {
    const relativePath = path.relative(this.config.sourceDir, filePath);
    return path
      .basename(relativePath, path.extname(relativePath))
      .replace(/\.(post|tech|tech-radar)$/, "");
  }

  private async compileContent(
    filePath: string,
    content: string,
    contentType: string,
  ): Promise<
    Result<
      {
        html: string;
        assets: Array<{ sourcePath: string; destinationPath: string }>;
      },
      string
    >
  > {
    // Currently only posts are supported
    if (contentType === "post") {
      return await compilePost({
        sourceFilePath: filePath,
        sourceFileText: content,
        hrefRoot: this.config.hrefRoot,
        codeLineNumbers: this.config.codeLineNumbers,
        removeH1: this.config.removeH1,
      });
    }

    // Tech radar compilation will be added here
    return failure(
      "unsupported content type",
      `Compilation not yet supported for content type: ${contentType}`,
    );
  }

  private generateHash(content: string): string {
    return crypto.createHash("md5").update(content).digest("hex");
  }

  private generateManifestEntry(
    slug: string,
    contentType: string,
    metadata: any,
    content: string,
    compiledHtml: string,
    hash: string,
  ): {
    fileName: string;
    href: string;
    lastUpdateDate: string | null;
    publishDate: string;
    hash: string;
  } & { [key: string]: unknown } {
    // Generate filename using the same logic as the old processor
    const fileName =
      contentType === "post"
        ? getCompiledPostFileName(slug, compiledHtml)
        : `${slug}.html`;

    const href = joinUrlPath(this.config.hrefRoot, fileName);

    // Get old entry for comparison
    const oldEntry = this.oldManifests[contentType]?.[slug] as any;

    // Always convert publishDate to ISO, preserving from old manifest if available
    const publishDate = new Date(
      oldEntry?.publishDate ?? new Date(),
    ).toISOString();

    // Check if content has been updated - prefer hash comparison, fallback to filename
    const hasBeenUpdated = oldEntry
      ? oldEntry.hash !== undefined
        ? oldEntry.hash !== hash
        : oldEntry.fileName !== fileName
      : false;

    // Handle lastUpdateDate logic matching the old processor
    const lastUpdateDate = hasBeenUpdated
      ? new Date().toISOString()
      : oldEntry?.lastUpdateDate
        ? new Date(oldEntry.lastUpdateDate).toISOString()
        : null;

    // Calculate reading time for posts
    const readingTime =
      contentType === "post" ? getReadingTime(content) : undefined;

    const result: any = {
      ...metadata,
      fileName,
      href,
      publishDate,
      lastUpdateDate,
      hash,
      slug,
    };

    if (readingTime) {
      result.readingTime = readingTime;
    }

    return result;
  }

  private async writeCompiledContent(
    slug: string,
    contentType: string,
    html: string,
    assets: Array<{ sourcePath: string; destinationPath: string }>,
  ): Promise<void> {
    // Write HTML file using the same filename logic as generateManifestEntry
    const htmlFileName =
      contentType === "post"
        ? getCompiledPostFileName(slug, html)
        : `${slug}.html`;
    const htmlPath = path.join(this.config.outputDir, htmlFileName);
    await writeTextFile(htmlPath, html);

    // Copy assets
    await Promise.all(
      assets.map((asset) =>
        copyFile(
          asset.sourcePath,
          path.join(this.config.outputDir, asset.destinationPath),
        ),
      ),
    );
  }
}

/**
 * Main orchestration function - replaces the old update() function.
 */
export async function processContent(
  config: OrchestratorConfig,
): Promise<Result<ManifestMap, string>> {
  const orchestrator = new ContentOrchestrator(config);

  // 1. Load all manifests BEFORE cleaning
  const loadResult = await orchestrator.loadManifests();
  if (!loadResult.success) {
    return loadResult;
  }

  // Clean output directory if requested (after loading manifests)
  if (config.clean) {
    await deleteDirectories(path.resolve(config.outputDir));
  }

  // 2. Find all files
  const filesResult = await orchestrator.findFiles();
  if (!filesResult.success) {
    return filesResult;
  }

  // 3. Process files individually
  const processedContent: ProcessedContent[] = [];
  for (const filePath of filesResult.value) {
    const result = await orchestrator.processFile(filePath);
    if (!result.success) {
      return failure("file processing failed", result.message);
    }
    if (result.value) {
      processedContent.push(result.value);
    }
  }

  // 4. Update manifests
  const updateResult = await orchestrator.updateManifests(processedContent);
  if (!updateResult.success) {
    return updateResult;
  }

  return success(orchestrator.getManifests());
}
