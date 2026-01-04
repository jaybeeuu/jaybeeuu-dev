import { failure, success, type Result } from "@jaybeeuu/utilities";
import { getHash } from "../hash.js";
import { type Manifest, type ManifestEntry } from "../../../manifest.js";
import { writeJsonFile } from "../../../files/index.js";

export const buildManifest = <CustomManifestEntryProperties>(
  entries: Map<string, ManifestEntry<CustomManifestEntryProperties>>,
): Manifest<CustomManifestEntryProperties> => {
  const entriesObject = Object.fromEntries(entries);
  const entriesHash = getHash(
    JSON.stringify(entriesObject, Object.keys(entriesObject).sort()),
  );

  return {
    version: 2,
    metadata: {
      generatedAt: new Date().toISOString(),
      entryCount: entries.size,
      overallHash: entriesHash,
    },
    entries: entriesObject,
  };
};

export type WriteManifestFailureReason = "manifest write failed";

export async function writeManifest<Metadata>(
  contentType: string,
  manifest: Manifest<Metadata>,
  manifestPath: string,
): Promise<Result<void, WriteManifestFailureReason>> {
  try {
    await writeJsonFile(manifestPath, manifest);
    return success(undefined);
  } catch (error) {
    return failure(
      "manifest write failed",
      `Failed to write manifest for ${contentType}: ${String(error)}`,
    );
  }
}
