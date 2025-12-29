import { failure, success, type Result } from "@jaybeeuu/utilities";
import fs from "node:fs";
import path from "node:path";
import { deleteDirectories } from "../files/index.js";
import {
  type ContentDefinition,
  type ContentDefManifest,
  type ContentDefManifestEntry,
} from "./content-definition.js";
import { processFile } from "./services/content-processor.js";
import { discoverFilesForContentType } from "./services/file-discovery.js";
import { ManifestEntriesManager } from "./services/manifest-entries-manager.js";
import {
  buildManifest,
  getOldManifestEntriesWithFallback,
  writeManifest,
} from "./services/manifest/index.js";

export interface OrchestratorConfig {
  clean: boolean;
}

export type ProcessContentFailureReason =
  | "manifest load failed"
  | "file discovery failed"
  | "file processing failed"
  | "slug already exists"
  | "manifest write failed";

export const processContent = async <ContentDef extends ContentDefinition>(
  contentDef: ContentDef,
  { clean }: OrchestratorConfig,
): Promise<
  Result<ContentDefManifest<ContentDef>, ProcessContentFailureReason>
> => {
  const resolvedOutputDir = path.resolve(contentDef.outputDir);

  const manifestPath = path.resolve(
    resolvedOutputDir,
    contentDef.manifestFileName,
  );

  const manifestResult = await getOldManifestEntriesWithFallback(
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
    const result = await processFile({
      filePath,
      oldManifest: manifestData,
      contentDef,
    });

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
};
