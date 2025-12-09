import type { Result } from "@jaybeeuu/utilities";
import { failure, repackError, success } from "@jaybeeuu/utilities";
import fs from "node:fs";
import path from "node:path";
import { deleteDirectories } from "../files/index.js";
import type {
  ContentDefManifest,
  ContentDefManifestEntry,
  CustomManifestEntryProperties,
} from "./content-types.js";
import { type ContentTypeDefinition } from "./content-types.js";
import { processFile } from "./services/content-processor.js";
import { discoverFilesForContentType } from "./services/file-discovery.js";
import { ManifestEntriesManager } from "./services/manifest-entries-manager.js";
import {
  buildManifest,
  getOldManifestWithFallback,
  writeManifest,
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
  contentDef: ContentDef,
  clean: boolean,
): Promise<
  Result<
    Manifest<CustomManifestEntryProperties<ContentDef>>,
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
    ContentDefManifestEntry<ContentDef>
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

  const writeResult = await writeManifest(
    contentDef.contentType,
    manifest,
    manifestPath,
  );

  if (!writeResult.success) {
    return failure("manifest write failed", writeResult.message);
  }

  return success(manifest);
}

export type ProcessContentFailureReason = "content type processing failed";

export type ContentTypeDefinitionMap = {
  [ContentType in string]: ContentTypeDefinition<ContentType>;
};

export type ContentTypeManifestMap<Content extends ContentTypeDefinitionMap> = {
  [K in keyof Content]: ContentDefManifest<Content[K]>;
};

export async function processContent<
  const ContentTypeDefs extends ContentTypeDefinitionMap,
>(
  config: OrchestratorConfig,
  contentDefDefinitions: ContentTypeDefs,
): Promise<
  Result<ContentTypeManifestMap<ContentTypeDefs>, ProcessContentFailureReason>
> {
  const manifests = {} as ContentTypeManifestMap<ContentTypeDefs>;

  for (const [contentType, contentDef] of Object.entries(
    contentDefDefinitions,
  )) {
    const result = await processContentType(contentDef, config.clean);

    if (!result.success) {
      return repackError(
        result,
        "content type processing failed",
        `${contentType}: ${result.message}`,
      );
    }

    manifests[contentType as keyof ContentTypeDefs] =
      result.value as ContentDefManifest<
        ContentTypeDefs[keyof ContentTypeDefs]
      >;
  }

  return success(manifests);
}
