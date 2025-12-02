import type { Result } from "@jaybeeuu/utilities";
import { failure, repackError, success } from "@jaybeeuu/utilities";
import fs from "node:fs";
import path from "node:path";
import { deleteDirectories } from "../files/index.js";
import type { ContentDefOutputMeta } from "./content-types.js";
import {
  type ContentTypeDefinition,
  type UnknownRecord,
} from "./content-types.js";
import { processFile } from "./services/content-processor.js";
import { discoverFilesForContentType } from "./services/file-discovery.js";
import { ManifestEntriesManager } from "./services/manifest-entries-manager.js";
import {
  buildManifest,
  getOldManifestWithFallback,
  writeManifest,
  type BaseManifestEntry,
  type Manifest,
} from "./services/manifest/index.js";

export interface OrchestratorConfig {
  clean: boolean;
}

export type ProcessContentTypeFailureReason =
  | "manifest load failed"
  | "file discovery failed"
  | "file processing failed"
  | "slug already exists"
  | "manifest write failed";

async function processContentType<ContentDef extends ContentTypeDefinition>(
  contentType: string,
  contentDef: ContentDef,
  clean: boolean,
): Promise<
  Result<
    Manifest<ContentDefOutputMeta<ContentDef>>,
    ProcessContentTypeFailureReason
  >
> {
  const resolvedOutputDir = path.resolve(contentDef.outputDir);

  const manifestPath = path.resolve(
    resolvedOutputDir,
    contentDef.manifestFileName,
  );

  const manifestResult = await getOldManifestWithFallback(
    manifestPath,
    contentDef.oldManifestLocators,
    contentDef.requireOldManifest,
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
    contentDef.sourceDir,
    contentDef.filePatterns,
  );
  if (!filesResult.success) {
    return filesResult;
  }

  const manifestEntries = new ManifestEntriesManager<
    BaseManifestEntry & ContentDefOutputMeta<ContentDef>
  >();

  for (const filePath of filesResult.value) {
    const result = await processFile(filePath, manifestData, contentDef);

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
    ? Manifest<BaseManifestEntry & OutputMeta>["entries"][string]
    : ContentTypeDef extends ContentTypeDefinition
      ? Manifest<BaseManifestEntry & UnknownRecord>["entries"][string]
      : never;

export async function processContent<
  const ContentTypeDefs extends { [key in string]: ContentTypeDefinition<key> },
>(
  config: OrchestratorConfig,
  contentDefDefinitions: ContentTypeDefs,
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

  for (const [contentType, contentDef] of Object.entries(
    contentDefDefinitions,
  )) {
    const result = await processContentType(
      contentType,
      // `Object.entries` yields `string`-typed values — assert as any
      contentDef as any,
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
