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
  isV2ManifestFile,
  // Entry types - using new names
  type V1BaseOutputMeta,
  type BaseOutputMeta,
  type ManifestEntry,
  isV1BaseOutputMeta,
  isBaseOutputMeta,
  // Backward compatibility aliases
  type V1Entry,
  type V2Entry,
  isV1Entry,
  isV2Entry,
} from "./manifest-operations.js";

// Re-export for backward compatibility
export type { ProcessingManifest as ManifestMap } from "./manifest-operations.js";

// Low-level utilities
export {
  getOldManifest,
  getOldManifestWithFallback,
  type GetOldManifestFailureReason,
} from "./old-manifest.js";
