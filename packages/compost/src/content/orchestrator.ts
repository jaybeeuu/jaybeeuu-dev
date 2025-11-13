import type { Result } from "@jaybeeuu/utilities";
import { failure, success } from "@jaybeeuu/utilities";
import path from "node:path";
import { deleteDirectories } from "../files/index.js";
import type { V2Manifest } from "./services/manifest/index.js";
import {
  buildManifest,
  writeManifest,
  getOldManifestWithFallback,
  type V2ManifestFile,
} from "./services/manifest/index.js";
import { discoverFilesForContentType } from "./services/file-discovery.js";
import {
  processFile,
  type ProcessedContent,
  type BaseManifestEntry,
} from "./services/content-processor.js";
import { ManifestEntriesManager } from "./services/manifest-entries-manager.js";
import { type V2Entry } from "./types.js";
import {
  contentResolverConfig,
  type ContentTypeDefinition,
  type ResolvedContentDefinition,
  type AnyResolvedContentDefinition,
} from "./content-types.js";

export type { ProcessedContent, BaseManifestEntry };

export interface OrchestratorConfig {
  clean: boolean;
}

function applyContentConfigDefaults<
  Type extends string,
  Metadata extends { [key: string]: unknown },
  CalculatedMetadata extends { [key: string]: unknown },
>(
  definition: ContentTypeDefinition<Type, Metadata, CalculatedMetadata>,
): ResolvedContentDefinition<
  ContentTypeDefinition<Type, Metadata, CalculatedMetadata>
> {
  return {
    ...definition,
    requireOldManifest: definition.requireOldManifest ?? true,
    manifestFileName:
      definition.manifestFileName ?? `${definition.contentType}-manifest.json`,
    sourceDir: definition.sourceDir ?? "src",
    outputDir: definition.outputDir ?? "out",
    oldManifestLocators: definition.oldManifestLocators ?? [],
  };
}

async function processContentType<
  Type extends string,
  Metadata extends { [key: string]: unknown },
  CalculatedMetadata extends { [key: string]: unknown },
>(
  contentType: Type,
  contentConfig: ResolvedContentDefinition<
    ContentTypeDefinition<Type, Metadata, CalculatedMetadata>
  >,
): Promise<
  Result<
    V2ManifestFile<Metadata, CalculatedMetadata>,
    | "manifest load failed"
    | "file discovery failed"
    | "file processing failed"
    | "slug already exists"
    | "manifest write failed"
  >
> {
  const manifestPath = path.resolve(
    contentConfig.outputDir,
    contentConfig.manifestFileName,
  );

  const manifestResult = await getOldManifestWithFallback(
    manifestPath,
    contentConfig.oldManifestLocators,
    contentConfig.requireOldManifest,
  );

  if (!manifestResult.success) {
    return failure("manifest load failed", manifestResult.message);
  }

  const manifestData = manifestResult.value;

  const filesResult = await discoverFilesForContentType(
    contentConfig.sourceDir,
    contentConfig.filePatterns,
  );
  if (!filesResult.success) {
    return filesResult;
  }

  const manifestEntries = new ManifestEntriesManager<
    V2Entry & Metadata & CalculatedMetadata
  >();

  for (const filePath of filesResult.value) {
    const result = await processFile(filePath, manifestData, contentConfig);

    if (!result.success) {
      return failure(
        "file processing failed",
        `${filePath}: ${result.message}`,
      );
    }

    if (result.value) {
      const addResult = manifestEntries.addEntry(
        result.value.slug,
        result.value.manifestEntry as V2Entry & Metadata & CalculatedMetadata,
        filePath,
      );

      if (!addResult.success) {
        return addResult;
      }
    }
  }

  // Build manifest object
  const manifest = buildManifest(manifestEntries.getEntries());

  // Write manifest immediately for this content type
  const writeResult = await writeManifest(contentType, manifest, contentConfig);
  if (!writeResult.success) {
    return failure("manifest write failed", writeResult.message);
  }

  return success(manifest as V2ManifestFile<Metadata, CalculatedMetadata>);
}

export async function processContent(
  config: OrchestratorConfig,
  contentConfigDefinitions: {
    [key: string]: ContentTypeDefinition<
      string,
      { [key: string]: unknown },
      { [key: string]: unknown }
    >;
  } = contentResolverConfig as unknown as {
    [key: string]: ContentTypeDefinition<
      string,
      { [key: string]: unknown },
      { [key: string]: unknown }
    >;
  },
): Promise<
  Result<
    {
      [contentType: string]: V2Manifest<
        { [key: string]: unknown },
        { [key: string]: unknown }
      >;
    },
    "content type processing failed"
  >
> {
  const orchestratorConfig = config;

  if (orchestratorConfig.clean) {
    // Clean output directories for all content types
    const outputDirs = new Set(
      Object.values(contentConfigDefinitions).map(
        (def) => def.outputDir ?? "out",
      ),
    );
    for (const outputDir of outputDirs) {
      await deleteDirectories(path.resolve(outputDir));
    }
  }

  const manifests: {
    [contentType: string]: V2Manifest<
      { [key: string]: unknown },
      { [key: string]: unknown }
    >;
  } = {};

  for (const [contentType, definition] of Object.entries(
    contentConfigDefinitions,
  )) {
    const contentConfig = applyContentConfigDefaults(definition);

    const result = await processContentType(contentType, contentConfig);

    if (!result.success) {
      return failure(
        "content type processing failed",
        `${contentType}: ${result.message}`,
      );
    }

    manifests[contentType] = result.value;
  }

  return success(manifests);
}
