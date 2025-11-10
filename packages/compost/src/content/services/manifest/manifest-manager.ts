import type { Result } from "@jaybeeuu/utilities";
import { failure, success } from "@jaybeeuu/utilities";
import path from "node:path";
import { writeJsonFile } from "../../../files/index.js";
import { getOldManifest } from "./old-manifest.js";
import { contentResolverConfig } from "../../content-types.js";
import { getSha1Hex } from "../../../hash.js";

import type { V1Entry, V2Entry, ManifestEntry } from "../../types.js";
import { is, isObject, isRecordOf, isUnionOf } from "@jaybeeuu/is";
import type { TypePredicate } from "@jaybeeuu/is";

/**
 * V1 manifest file format (flat object).
 */
export type V1ManifestFile = { [slug: string]: V1Entry };

/**
 * V2 manifest file format (versioned wrapper).
 * Generic to allow for different content type entry structures.
 */
export interface V2ManifestFile<TEntry extends V2Entry = V2Entry> {
  version: number;
  metadata: {
    generatedAt: string;
    entryCount: number;
    overallHash: string;
  };
  entries: { [slug: string]: TEntry };
}

/**
 * Validators for manifest file formats.
 */
export const isV1ManifestFile = isRecordOf(
  isObject({
    fileName: is("string"),
    href: is("string"),
    lastUpdateDate: isUnionOf(is("string"), is("null")),
    publishDate: is("string"),
  }),
);

export const isV2ManifestFile = <TEntry extends V2Entry>(
  entryPredicate: TypePredicate<TEntry>,
) =>
  isObject({
    version: is("number"),
    metadata: isObject({
      generatedAt: is("string"),
      entryCount: is("number"),
      overallHash: is("string"),
    }),
    entries: isRecordOf(entryPredicate),
  });

/**
 * Union type for loading either format.
 */
export type LoadedManifestFile = V1ManifestFile | V2ManifestFile;

/**
 * Maps content types to their NEW manifest structures.
 * The new system always produces V2 format manifests with content-specific extensions.
 */
export interface ProcessingManifest {
  [contentType: string]: { [slug: string]: ManifestEntry };
}

/**
 * Maps content types to their OLD manifest structures (from loading).
 * Old manifests can be V1 or V2 format depending on when they were created.
 */
type LoadedOldManifests = {
  [contentType: string]: { [slug: string]: V1Entry | V2Entry | unknown };
};

/**
 * Configuration for manifest management.
 */
export interface ManifestConfig {
  outputDir: string;
  manifestFileName: string;
  oldManifestLocators: string[];
  requireOldManifest: boolean;
}

/**
 * Service responsible for loading and saving content manifests.
 *
 * Handles both legacy (V1) and versioned (V2+) manifest formats,
 * providing backwards compatibility while supporting new features.
 */
export class ManifestManager {
  #oldManifests: LoadedOldManifests = {};
  #newManifests: ProcessingManifest = {};

  /**
   * Load all existing manifests for change detection.
   *
   * @param config - Manifest configuration
   * @returns Promise resolving to success or failure
   */
  async loadManifests(config: ManifestConfig): Promise<Result<void, string>> {
    try {
      for (const contentType of Object.keys(contentResolverConfig)) {
        const manifestFileName = `${contentType}-manifest.json`;
        const manifestPath = path.resolve(config.outputDir, manifestFileName);

        // For backward compatibility, also try the old manifest filename for posts
        const oldManifestLocators = [...config.oldManifestLocators];
        if (contentType === "post") {
          const oldManifestPath = path.resolve(
            config.outputDir,
            config.manifestFileName,
          );
          oldManifestLocators.unshift(oldManifestPath);
        }

        const result = await getOldManifest(manifestPath, oldManifestLocators);

        if (result.success) {
          // Handle both versioned (v2+) and legacy (v1) manifest formats
          const manifestData = result.value;
          if (
            typeof manifestData === "object" &&
            "version" in manifestData &&
            "entries" in manifestData
          ) {
            // New versioned format - access entries safely
            const versionedManifest = manifestData as unknown as {
              entries: { [key: string]: unknown };
            };
            this.#oldManifests[contentType] = versionedManifest.entries;
          } else {
            // Legacy format - direct object
            this.#oldManifests[contentType] = manifestData as unknown as {
              [key: string]: unknown;
            };
          }
        } else if (config.requireOldManifest) {
          return failure(
            "manifest load failed",
            `Failed to load required manifest for ${contentType}: ${result.message}`,
          );
        } else {
          this.#oldManifests[contentType] = {};
        }

        this.#newManifests[contentType] = {};
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
   * Get the old manifest for a specific content type.
   *
   * @param contentType - The content type to get manifest for
   * @returns The old manifest object or empty object if not found
   */
  getOldManifest(contentType: string): { [slug: string]: unknown } {
    return this.#oldManifests[contentType] || {};
  }

  /**
   * Add processed content to the new manifests.
   *
   * @param contentType - The content type
   * @param slug - The content slug
   * @param manifestEntry - The manifest entry to add
   */
  addManifestEntry(
    contentType: string,
    slug: string,
    manifestEntry: ManifestEntry,
  ): void {
    if (!this.#newManifests[contentType]) {
      this.#newManifests[contentType] = {};
    }
    const manifest = this.#newManifests[contentType];
    if (manifest) {
      manifest[slug] = manifestEntry;
    }
  }

  /**
   * Write all manifests with version information.
   *
   * @param config - Manifest configuration
   * @returns Promise resolving to success or failure
   */
  async writeManifests(config: ManifestConfig): Promise<Result<void, string>> {
    try {
      for (const [contentType, manifest] of Object.entries(
        this.#newManifests,
      )) {
        const manifestFileName = `${contentType}-manifest.json`;
        const manifestPath = path.resolve(config.outputDir, manifestFileName);

        const entriesHash = this.generateHash(
          JSON.stringify(manifest, Object.keys(manifest).sort()),
        );

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
   *
   * @returns The new manifests map
   */
  getManifests(): ProcessingManifest {
    // Return just the entries for backward compatibility with existing code
    return this.#newManifests;
  }

  /**
   * Generate SHA1 hash for content.
   *
   * @param content - Content to hash
   * @returns SHA1 hash string
   */
  private generateHash(content: string): string {
    return getSha1Hex(content);
  }
}
