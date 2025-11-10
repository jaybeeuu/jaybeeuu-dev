import type { Result } from "@jaybeeuu/utilities";
import { failure, success } from "@jaybeeuu/utilities";
import path from "node:path";
import { deleteDirectories } from "../files/index.js";
import {
  ManifestManager,
  type ManifestMap,
} from "./services/manifest/index.js";
import { discoverContentFiles } from "./services/file-discovery.js";
import {
  processFile,
  type ProcessedContent,
  type BaseManifestEntry,
  type OldManifest,
} from "./services/content-processor.js";
import { contentResolverConfig } from "./content-types.js";

// Re-export types for backwards compatibility
export type { ProcessedContent, ManifestMap, BaseManifestEntry };

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
 * Process a single file using the content processor service.
 */
async function processContentFile(
  filePath: string,
  config: Pick<
    OrchestratorConfig,
    | "sourceDir"
    | "outputDir"
    | "hrefRoot"
    | "includeUnpublished"
    | "codeLineNumbers"
    | "removeH1"
  >,
  manifestManager: ManifestManager,
): Promise<Result<ProcessedContent<string> | null, string>> {
  // The content processor determines content type and gets the appropriate old manifest
  // We need to pass all old manifests so it can choose the right one
  const allOldManifests: { [contentType: string]: OldManifest } = {};

  for (const contentType of Object.keys(contentResolverConfig)) {
    allOldManifests[contentType] = manifestManager.getOldManifest(
      contentType,
    ) as OldManifest;
  }

  return processFile(filePath, allOldManifests, config, contentResolverConfig);
}

/**
 * Update all manifests with processed content.
 */
async function updateManifests(
  processedContent: ProcessedContent<string>[],
  config: Pick<
    OrchestratorConfig,
    | "outputDir"
    | "manifestFileName"
    | "oldManifestLocators"
    | "requireOldManifest"
  >,
  manifestManager: ManifestManager,
): Promise<Result<void, string>> {
  for (const content of processedContent) {
    manifestManager.addManifestEntry(
      content.contentType,
      content.slug,
      content.manifestEntry,
    );
  }

  return manifestManager.writeManifests(config);
}

/**
 * Main orchestration function - replaces the old update() function.
 */
export async function processContent(
  config: OrchestratorConfig,
): Promise<Result<ManifestMap, string>> {
  const manifestManager = new ManifestManager();

  const loadResult = await manifestManager.loadManifests(config);
  if (!loadResult.success) {
    return loadResult;
  }

  if (config.clean) {
    await deleteDirectories(path.resolve(config.outputDir));
  }

  const filesResult = await discoverContentFiles(config);
  if (!filesResult.success) {
    return filesResult;
  }

  const processedContent: ProcessedContent<string>[] = [];
  for (const filePath of filesResult.value) {
    const result = await processContentFile(filePath, config, manifestManager);
    if (!result.success) {
      return failure("file processing failed", result.message);
    }
    if (result.value) {
      processedContent.push(result.value);
    }
  }

  const updateResult = await updateManifests(
    processedContent,
    config,
    manifestManager,
  );
  if (!updateResult.success) {
    return updateResult;
  }

  return success(manifestManager.getManifests());
}
