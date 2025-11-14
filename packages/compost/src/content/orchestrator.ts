import type { Result } from "@jaybeeuu/utilities";
import { failure, repackError, success } from "@jaybeeuu/utilities";
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
} from "./services/content-processor.js";
import { ManifestEntriesManager } from "./services/manifest-entries-manager.js";
import { type V2Entry } from "./services/manifest/index.js";
import {
  contentResolverConfig,
  type ContentTypeDefinition,
  type ResolvedContentDefinition,
  type BaseInputMetadata,
} from "./content-types.js";

export type { ProcessedContent } from "./services/content-processor.js";

export interface OrchestratorConfig {
  clean: boolean;
}

function applyContentConfigDefaults<
  Type extends string,
  InputMeta extends { [key: string]: unknown },
  OutputMeta extends Record<string, unknown>,
>(
  definition: ContentTypeDefinition<Type, InputMeta, OutputMeta>,
): ResolvedContentDefinition<
  ContentTypeDefinition<Type, InputMeta, OutputMeta>
> {
  return {
    ...definition,
    requireOldManifest: definition.requireOldManifest ?? true,
    manifestFileName:
      definition.manifestFileName ?? `${definition.contentType}-manifest.json`,
    sourceDir: definition.sourceDir ?? "src",
    outputDir: definition.outputDir ?? "out",
    oldManifestLocators: definition.oldManifestLocators ?? [],
    mapToOutputMeta:
      definition.mapToOutputMeta ??
      ((input: InputMeta & BaseInputMetadata) =>
        input as unknown as OutputMeta),
  };
}

export type ProcessContentTypeFailureReason =
  | "manifest load failed"
  | "file discovery failed"
  | "file processing failed"
  | "slug already exists"
  | "manifest write failed";

async function processContentType<
  Type extends string,
  InputMeta extends { [key: string]: unknown },
  OutputMeta extends Record<string, unknown>,
>(
  contentType: Type,
  contentConfig: ResolvedContentDefinition<
    ContentTypeDefinition<Type, InputMeta, OutputMeta>
  >,
  clean: boolean,
): Promise<
  Result<V2ManifestFile<V2Entry & OutputMeta>, ProcessContentTypeFailureReason>
> {
  const manifestPath = path.resolve(
    contentConfig.outputDir,
    contentConfig.manifestFileName,
  );

  // Load old manifest BEFORE cleaning to preserve migration data
  const manifestResult = await getOldManifestWithFallback(
    manifestPath,
    contentConfig.oldManifestLocators,
    contentConfig.requireOldManifest,
  );

  if (!manifestResult.success) {
    return failure("manifest load failed", manifestResult.message);
  }

  // Clean output directory AFTER loading old manifest
  if (clean) {
    await deleteDirectories(path.resolve(contentConfig.outputDir));
  }

  const manifestData = manifestResult.value;

  const filesResult = await discoverFilesForContentType(
    contentConfig.sourceDir,
    contentConfig.filePatterns,
  );
  if (!filesResult.success) {
    return filesResult;
  }

  const manifestEntries = new ManifestEntriesManager<V2Entry & OutputMeta>();

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
        result.value.manifestEntry,
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

  return success(manifest as V2ManifestFile<V2Entry & OutputMeta>);
}

export type ProcessContentFailureReason = "content type processing failed";

export async function processContent(
  config: OrchestratorConfig,
  contentConfigDefinitions: Record<string, any> = contentResolverConfig,
): Promise<
  Result<
    {
      [contentType: string]: V2Manifest<Record<string, unknown>>;
    },
    ProcessContentFailureReason
  >
> {
  const orchestratorConfig = config;

  const manifests: {
    [contentType: string]: V2Manifest<Record<string, unknown>>;
  } = {};

  for (const [contentType, definition] of Object.entries(
    contentConfigDefinitions,
  )) {
    const contentConfig = applyContentConfigDefaults(definition);

    const result = await processContentType(
      contentType,
      contentConfig,
      orchestratorConfig.clean,
    );

    if (!result.success) {
      return repackError(
        result,
        "content type processing failed",
        `${contentType}: ${result.message}`,
      );
    }

    manifests[contentType] = result.value;
  }

  return success(manifests);
}
