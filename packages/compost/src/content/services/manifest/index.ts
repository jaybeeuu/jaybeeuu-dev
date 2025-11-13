// Simplified API - direct operations only
export {
  getOldManifestEntries,
  buildManifest,
  writeManifest,
  type LoadedManifestData,
  type ProcessingManifest,
  type OldManifest,
  type OldManifestEntry,
  type V2ManifestFile,
  type V2Manifest,
  isV2ManifestFile,
} from "./manifest-operations.js";

// Re-export for backward compatibility
export type { ProcessingManifest as ManifestMap } from "./manifest-operations.js";

// Low-level utilities
export {
  getOldManifest,
  getOldManifestWithFallback,
  type GetOldManifestFailureReason,
} from "./old-manifest.js";
