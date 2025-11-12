import type { Result } from "@jaybeeuu/utilities";
import { failure, success } from "@jaybeeuu/utilities";
import path from "node:path";
import { deleteDirectories } from "../files/index.js";
import type { ProcessingManifest as ManifestMap } from "./services/manifest/index.js";
import { writeJsonFile } from "../files/index.js";
import { getSha1Hex } from "../hash.js";
import {
  processFile,
  type ProcessedContent,
  type BaseManifestEntry,
} from "./services/content-processor.js";
import type { ManifestEntry } from "./types.js";
import {
  contentResolverConfig,
  type ContentTypeDefinition,
  type ContentConfig,
} from "./content-types.js";

export type { ProcessedContent, ManifestMap, BaseManifestEntry };
export type { ContentTypeManifest };

export interface OrchestratorConfig {
  sourceDir: string;
  outputDir: string; // Required for compatibility with content processor
  hrefRoot: string;
  includeUnpublished: boolean;
  codeLineNumbers: boolean;
  removeH1: boolean;
  clean: boolean;

  globalOutputDir?: string;
  globalManifestFileName?: string;
  globalOldManifestLocators?: string[];
  globalRequireOldManifest?: boolean;
}

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

    globalOutputDir: undefined,
    globalManifestFileName: options.manifestFileName,
    globalOldManifestLocators: options.oldManifestLocators,
    globalRequireOldManifest: options.requireOldManifest,
  };
}

function applyContentConfigDefaults(
  definition: ContentTypeDefinition<string, object>,
  config: OrchestratorConfig,
  orchestratorOverrides: {
    outputDir?: string;
    manifestFileName?: string;
    oldManifestLocators?: string[];
    requireOldManifest?: boolean;
  } = {},
): ContentConfig<string, object> {
  return {
    ...definition,
    requireOldManifest:
      orchestratorOverrides.requireOldManifest ??
      definition.requireOldManifest ??
      true,

    manifestFileName:
      orchestratorOverrides.manifestFileName ??
      definition.manifestFileName ??
      `${definition.contentType}-manifest.json`,

    outputDir:
      orchestratorOverrides.outputDir ??
      definition.outputDir ??
      config.outputDir,

    oldManifestLocators: [
      ...(orchestratorOverrides.oldManifestLocators ?? []),
      ...(definition.oldManifestLocators ?? []),
    ],

    validator: definition.validator,
  };
}

async function writeManifest(
  contentType: string,
  entries: Map<string, ManifestEntry>,
  config: ContentConfig<string, object>,
): Promise<Result<void, string>> {
  try {
    const manifestPath = path.resolve(
      config.outputDir,
      config.manifestFileName,
    );

    const entriesObject = Object.fromEntries(entries);
    const entriesHash = getSha1Hex(
      JSON.stringify(entriesObject, Object.keys(entriesObject).sort()),
    );

    const manifest = {
      version: 2,
      metadata: {
        generatedAt: new Date().toISOString(),
        entryCount: entries.size,
        overallHash: entriesHash,
      },
      entries: entriesObject,
    };

    await writeJsonFile(manifestPath, manifest);
    return success(undefined);
  } catch (error) {
    return failure(
      "manifest write failed",
      `Failed to write manifest for ${contentType}: ${error}`,
    );
  }
}

async function discoverFilesForContentType(
  sourceDir: string,
  filePatterns: {
    frontmatter: readonly string[];
    jsonMetadata: readonly string[];
    jsonSuffix: string;
  },
): Promise<Result<string[], string>> {
  try {
    const { recurseDirectory } = await import("../files/index.js");
    const patterns = [
      ...filePatterns.frontmatter,
      ...filePatterns.jsonMetadata,
    ];
    const includePatterns = patterns.map(
      (pattern) => new RegExp(`\\${pattern}$`),
    );

    const files: string[] = [];

    try {
      for await (const fileInfo of recurseDirectory(sourceDir, {
        include: includePatterns,
      })) {
        files.push(fileInfo.filePath);
      }
    } catch {
      // If source directory doesn't exist, return empty array
      return success([]);
    }

    return success(files);
  } catch (error) {
    return failure(
      "file discovery failed",
      `Failed to discover files for content type: ${error}`,
    );
  }
}

async function loadManifestData(
  contentType: string,
  contentConfig: ContentConfig<string, object>,
): Promise<
  Result<
    {
      [slug: string]: {
        fileName?: string;
        hash?: string;
        publishDate?: string | Date;
        lastUpdateDate?: string | Date | null;
        [key: string]: unknown;
      };
    },
    string
  >
> {
  try {
    const { getOldManifest } = await import(
      "./services/manifest/old-manifest.js"
    );

    const manifestPath = path.resolve(
      contentConfig.outputDir,
      contentConfig.manifestFileName,
    );

    const result = await getOldManifest(
      manifestPath,
      contentConfig.oldManifestLocators,
    );

    if (!result.success) {
      if (contentConfig.requireOldManifest) {
        return failure("manifest load failed", result.message);
      }
      return success({});
    }

    const entriesObject: {
      [slug: string]: {
        fileName?: string;
        hash?: string;
        publishDate?: string | Date;
        lastUpdateDate?: string | Date | null;
        [key: string]: unknown;
      };
    } = {};
    for (const [slug, entry] of Object.entries(result.value)) {
      entriesObject[slug] = entry;
    }

    return success(entriesObject);
  } catch (error) {
    return failure(
      "manifest load failed",
      `Failed to load manifest for ${contentType}: ${error}`,
    );
  }
}

interface ContentTypeManifest {
  contentType: string;
  config: ContentConfig<string, object>;
  entries: Map<string, ManifestEntry>;
}

async function processContentType(
  contentType: string,
  contentConfig: ContentConfig<string, object>,
  orchestratorConfig: OrchestratorConfig,
): Promise<Result<ContentTypeManifest, string>> {
  const manifestData = await loadManifestData(contentType, contentConfig);
  if (!manifestData.success) {
    return manifestData;
  }

  const filesResult = await discoverFilesForContentType(
    orchestratorConfig.sourceDir,
    contentConfig.filePatterns,
  );
  if (!filesResult.success) {
    return filesResult;
  }

  const oldManifests = { [contentType]: manifestData.value };
  const contentConfigs = { [contentType]: contentConfig };

  const manifestEntries = new Map<string, ManifestEntry>();

  for (const filePath of filesResult.value) {
    const result = await processFile(
      filePath,
      oldManifests,
      orchestratorConfig,
      contentConfigs,
    );

    if (!result.success) {
      return failure(`file processing failed: ${filePath}`, result.message);
    }

    if (result.value) {
      manifestEntries.set(result.value.slug, result.value.manifestEntry);
    }
  }

  return success({
    contentType,
    config: contentConfig,
    entries: manifestEntries,
  });
}

async function writeAllManifests(
  contentTypeManifests: ContentTypeManifest[],
): Promise<Result<void, string>> {
  for (const manifest of contentTypeManifests) {
    const writeResult = await writeManifest(
      manifest.contentType,
      manifest.entries,
      manifest.config,
    );

    if (!writeResult.success) {
      return writeResult;
    }
  }

  return success(undefined);
}

export interface ProcessContentResult {
  manifests: ManifestMap;
  individualManifests: { [contentType: string]: ContentTypeManifest };
}

export async function processContent(
  config: OrchestratorConfig | LegacyUpdateOptions,
  contentConfigDefinitions: {
    [key: string]: ContentTypeDefinition<string, object>;
  } = contentResolverConfig as {
    [key: string]: ContentTypeDefinition<string, object>;
  },
): Promise<Result<ProcessContentResult, string>> {
  const orchestratorConfig: OrchestratorConfig =
    "globalOutputDir" in config
      ? (config as OrchestratorConfig)
      : convertLegacyOptions(config as LegacyUpdateOptions);

  const orchestratorOverrides = {
    outputDir: orchestratorConfig.globalOutputDir,
    manifestFileName: orchestratorConfig.globalManifestFileName,
    oldManifestLocators: orchestratorConfig.globalOldManifestLocators,
    requireOldManifest: orchestratorConfig.globalRequireOldManifest,
  };

  if (orchestratorConfig.clean) {
    await deleteDirectories(path.resolve(orchestratorConfig.outputDir));
  }

  const contentTypeManifests: ContentTypeManifest[] = [];
  const allManifests: ManifestMap = {};

  for (const [contentType, definition] of Object.entries(
    contentConfigDefinitions,
  )) {
    const contentConfig = applyContentConfigDefaults(
      definition,
      orchestratorConfig,
      orchestratorOverrides,
    );

    const result = await processContentType(
      contentType,
      contentConfig,
      orchestratorConfig,
    );

    if (!result.success) {
      return failure(`${contentType} processing failed`, result.message);
    }

    contentTypeManifests.push(result.value);
    allManifests[contentType] = Object.fromEntries(result.value.entries);
  }

  // Write all manifests at orchestration level
  const writeResult = await writeAllManifests(contentTypeManifests);
  if (!writeResult.success) {
    return writeResult;
  }

  return success({
    manifests: allManifests,
    individualManifests: Object.fromEntries(
      contentTypeManifests.map((m) => [m.contentType, m]),
    ),
  });
}
