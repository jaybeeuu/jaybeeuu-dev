export { buildManifest, writeManifest } from "./manifest-operations.js";

export {
  getOldManifestEntriesWithFallback,
  detectContentChange,
  type GetOldManifestFailureReason,
  type OldManifestEntries,
  type OldManifestEntry,
} from "./old-manifest.js";
