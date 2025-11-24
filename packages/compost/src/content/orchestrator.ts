import type { Result } from "@jaybeeuu/utilities";
import { failure, repackError, success } from "@jaybeeuu/utilities";
import path from "node:path";
import fs from "node:fs";
import { deleteDirectories } from "../files/index.js";
import {
  buildManifest,
  writeManifest,
  getOldManifestWithFallback,
  type Manifest,
} from "./services/manifest/index.js";
import { discoverFilesForContentType } from "./services/file-discovery.js";
import { processFile } from "./services/content-processor.js";
import { ManifestEntriesManager } from "./services/manifest-entries-manager.js";
import { type BaseOutputMeta } from "./services/manifest/index.js";
import type { ContentDefOutputMeta } from "./content-types.js";
import {
  type ContentTypeDefinition,
  type ResolvedContentDefinition,
  type UnknownRecord,
} from "./content-types.js";

export interface OrchestratorConfig {
  clean: boolean;
}

function applyContentConfigDefaults<Content extends ContentTypeDefinition>(
  definition: Content,
): ResolvedContentDefinition<Content> {
  return {
    ...definition,
    requireOldManifest: definition.requireOldManifest ?? true,
    manifestFileName:
      definition.manifestFileName ?? `${definition.contentType}-manifest.json`,
    sourceDir: definition.sourceDir ?? "src",
    outputDir: definition.outputDir ?? "out",
    oldManifestLocators: definition.oldManifestLocators ?? [],
    mapToOutputMeta: definition.mapToOutputMeta,
  } as unknown as ResolvedContentDefinition<Content>;
}

export type ProcessContentTypeFailureReason =
  | "manifest load failed"
  | "file discovery failed"
  | "file processing failed"
  | "slug already exists"
  | "manifest write failed";

async function processContentType<Content extends ContentTypeDefinition>(
  contentType: string,
  contentConfig: ResolvedContentDefinition<Content>,
  clean: boolean,
): Promise<
  Result<
    Manifest<ContentDefOutputMeta<Content>>,
    ProcessContentTypeFailureReason
  >
> {
  const resolvedOutputDir = path.resolve(contentConfig.outputDir);

  const manifestPath = path.resolve(
    resolvedOutputDir,
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

  if (clean) {
    await deleteDirectories(resolvedOutputDir);
  }

  await fs.promises.mkdir(resolvedOutputDir, { recursive: true });

  const manifestData = manifestResult.value;

  const filesResult = await discoverFilesForContentType(
    contentConfig.sourceDir,
    contentConfig.filePatterns,
  );
  if (!filesResult.success) {
    return filesResult;
  }

  const manifestEntries = new ManifestEntriesManager<
    BaseOutputMeta & ContentDefOutputMeta<Content>
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
        result.value.manifestEntry,
        filePath,
      );

      if (!addResult.success) {
        return addResult;
      }
    }
  }

  const manifest = buildManifest(manifestEntries.getEntries());

  const writeResult = await writeManifest(contentType, manifest, manifestPath);

  if (!writeResult.success) {
    return failure("manifest write failed", writeResult.message);
  }

  return success(manifest);
}

export type ProcessContentFailureReason = "content type processing failed";

export type ManifestEntry<ContentTypeDef extends ContentTypeDefinition> =
  ContentTypeDef extends ContentTypeDefinition<
    string,
    UnknownRecord,
    infer OutputMeta
  >
    ? Manifest<BaseOutputMeta & OutputMeta>["entries"][string]
    : ContentTypeDef extends ContentTypeDefinition
      ? Manifest<BaseOutputMeta & UnknownRecord>["entries"][string]
      : never;

export async function processContent<
  ContentTypeDefs extends { [key: string]: ContentTypeDefinition },
>(
  config: OrchestratorConfig,
  contentConfigDefinitions: ContentTypeDefs,
): Promise<
  Result<
    {
      [K in keyof ContentTypeDefs]: Manifest<ManifestEntry<ContentTypeDefs[K]>>;
    },
    ProcessContentFailureReason
  >
> {
  const manifests = {} as {
    [type: string]: Manifest;
  };

  for (const [contentType, definition] of Object.entries(
    contentConfigDefinitions,
  )) {
    const contentConfig = applyContentConfigDefaults(definition);

    const result = await processContentType(
      contentType,
      contentConfig,
      config.clean,
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

  return success(
    manifests as {
      [K in keyof ContentTypeDefs]: Manifest<ManifestEntry<ContentTypeDefs[K]>>;
    },
  );
}
