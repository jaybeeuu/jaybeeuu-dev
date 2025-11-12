import type { Result } from "@jaybeeuu/utilities";
import type { TypePredicate } from "@jaybeeuu/is";
import { failure, success } from "@jaybeeuu/utilities";
import path from "node:path";
import { deleteDirectories } from "../files/index.js";
import {
  loadManifestData,
  getOldManifestsForAllContentTypes,
  createManifestBuilder,
  addManifestEntry,
  writeManifests,
  getManifestMap,
  type ManifestBuilder,
  type ProcessingManifest as ManifestMap,
} from "./services/manifest/index.js";
import { discoverContentFiles } from "./services/file-discovery.js";
import {
  processFile,
  type ProcessedContent,
  type BaseManifestEntry,
} from "./services/content-processor.js";
import {
  contentResolverConfig,
  type AnyContentConfigDefinitionMap,
  type AnyContentConfigMap,
  type AnyContentConfigDefinition,
  type AnyContentConfig,
} from "./content-types.js";

// Re-export types for backwards compatibility
export type { ProcessedContent, ManifestMap, BaseManifestEntry };

/**
 * Configuration for the content orchestrator.
 */
export interface OrchestratorConfig {
  sourceDir: string;
  outputDir: string; // Required for compatibility with content processor
  hrefRoot: string;
  includeUnpublished: boolean;
  codeLineNumbers: boolean;
  removeH1: boolean;
  clean: boolean;

  // Global overrides for content-specific settings
  globalOutputDir?: string;
  globalManifestFileName?: string;
  globalOldManifestLocators?: string[];
  globalRequireOldManifest?: boolean;
}

/**
 * Legacy configuration format for backward compatibility.
 * Used by CLI and tests.
 */
export interface LegacyUpdateOptions {
  additionalWatchPaths?: string[];
  hrefRoot: string;
  includeUnpublished: boolean;
  codeLineNumbers: boolean;
  manifestFileName?: string;
  oldManifestLocators?: string[];
  outputDir: string;
  requireOldManifest?: boolean;
  sourceDir: string;
  watch?: boolean;
  removeH1: boolean;
  clean: boolean;
}

/**
 * Convert legacy UpdateOptions to new OrchestratorConfig format.
 */
function convertLegacyOptions(
  options: LegacyUpdateOptions,
): OrchestratorConfig {
  return {
    sourceDir: options.sourceDir,
    outputDir: options.outputDir,
    hrefRoot: options.hrefRoot,
    includeUnpublished: options.includeUnpublished,
    codeLineNumbers: options.codeLineNumbers,
    removeH1: options.removeH1,
    clean: options.clean,

    // Convert legacy global settings to new global overrides
    globalOutputDir: undefined, // Don't override - use content-specific defaults
    globalManifestFileName: options.manifestFileName,
    globalOldManifestLocators: options.oldManifestLocators,
    globalRequireOldManifest: options.requireOldManifest,
  };
}

/**
 * Update all manifests with processed content.
 */
/**
 * Apply default values to content configuration definitions.
 * Converts user-facing optional configs to runtime required configs.
 */
function applyContentConfigDefaults<T extends string, M>(
  definition: AnyContentConfigDefinition,
  config: OrchestratorConfig,
  orchestratorOverrides: {
    outputDir?: string;
    manifestFileName?: string;
    oldManifestLocators?: string[];
    requireOldManifest?: boolean;
  } = {},
): AnyContentConfig {
  return {
    ...definition,
    requireOldManifest:
      orchestratorOverrides.requireOldManifest ??
      definition.requireOldManifest ??
      true, // Default

    manifestFileName:
      orchestratorOverrides.manifestFileName ??
      definition.manifestFileName ??
      `${definition.contentType}-manifest.json`, // Default

    outputDir:
      orchestratorOverrides.outputDir ??
      definition.outputDir ??
      config.outputDir, // Use orchestrator outputDir as fallback

    oldManifestLocators: [
      ...(orchestratorOverrides.oldManifestLocators ?? []),
      ...(definition.oldManifestLocators ?? []),
    ],

    // Pass through the validator for content-specific manifest validation
    validator: definition.validator,
  };
}

function buildManifestFromProcessedContent(
  processedContent: ProcessedContent<string>[],
): ManifestBuilder {
  let builder = createManifestBuilder();

  for (const content of processedContent) {
    builder = addManifestEntry(
      builder,
      content.contentType,
      content.slug,
      content.manifestEntry,
    );
  }

  return builder;
}

/**
 * Main orchestration function - replaces the old update() function.
 * Supports both new OrchestratorConfig and legacy UpdateOptions for backward compatibility.
 */
export async function processContent(
  config: OrchestratorConfig | LegacyUpdateOptions,
  contentConfigDefinitions: AnyContentConfigDefinitionMap = contentResolverConfig,
): Promise<Result<ManifestMap, string>> {
  // Convert legacy options to new format if needed
  const orchestratorConfig: OrchestratorConfig =
    "globalOutputDir" in config
      ? (config as OrchestratorConfig)
      : convertLegacyOptions(config as LegacyUpdateOptions);
  // Apply defaults early - convert definitions to fully populated runtime configs
  const contentConfigs: AnyContentConfigMap = {};
  const orchestratorOverrides = {
    outputDir: orchestratorConfig.globalOutputDir,
    manifestFileName: orchestratorConfig.globalManifestFileName,
    oldManifestLocators: orchestratorConfig.globalOldManifestLocators,
    requireOldManifest: orchestratorConfig.globalRequireOldManifest,
  };

  for (const [contentType, definition] of Object.entries(
    contentConfigDefinitions,
  )) {
    contentConfigs[contentType] = applyContentConfigDefaults(
      definition,
      orchestratorConfig,
      orchestratorOverrides,
    );
  }

  // Load all manifest data upfront using fully populated configs
  // Extract just the properties needed for manifest loading
  const manifestConfigs: {
    [contentType: string]: {
      outputDir: string;
      manifestFileName: string;
      oldManifestLocators: string[];
      requireOldManifest: boolean;
      validator: TypePredicate<object>;
    };
  } = {};
  for (const [contentType, config] of Object.entries(contentConfigs)) {
    manifestConfigs[contentType] = {
      outputDir: config.outputDir,
      manifestFileName: config.manifestFileName,
      oldManifestLocators: config.oldManifestLocators,
      requireOldManifest: config.requireOldManifest,
      validator: config.validator,
    };
  }
  const manifestDataResult = await loadManifestData(manifestConfigs);
  if (!manifestDataResult.success) {
    return manifestDataResult;
  }
  const manifestData = manifestDataResult.value;

  if (orchestratorConfig.clean) {
    await deleteDirectories(path.resolve(orchestratorConfig.outputDir));
  }

  const filesResult = await discoverContentFiles(
    orchestratorConfig,
    contentConfigs,
  );
  if (!filesResult.success) {
    return filesResult;
  }

  // Convert loaded manifest data to legacy format for content processor
  const allOldManifests = getOldManifestsForAllContentTypes(
    manifestData,
    contentConfigs,
  );

  const processedContent: ProcessedContent<string>[] = [];
  for (const filePath of filesResult.value) {
    const result = await processFile(
      filePath,
      allOldManifests,
      orchestratorConfig,
      contentConfigs,
    );
    if (!result.success) {
      return failure("file processing failed", result.message);
    }
    if (result.value) {
      processedContent.push(result.value);
    }
  }

  const manifestBuilder = buildManifestFromProcessedContent(processedContent);

  const writeConfigs: {
    [contentType: string]: { outputDir: string; manifestFileName: string };
  } = {};
  for (const [contentType, config] of Object.entries(contentConfigs)) {
    writeConfigs[contentType] = {
      outputDir: config.outputDir,
      manifestFileName: config.manifestFileName,
    };
  }
  const writeResult = await writeManifests(manifestBuilder, writeConfigs);
  if (!writeResult.success) {
    return writeResult;
  }

  return success(getManifestMap(manifestBuilder));
}
