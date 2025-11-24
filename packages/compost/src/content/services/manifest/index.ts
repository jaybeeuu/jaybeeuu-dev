// Simplified API - direct operations only
export {
  buildManifest,
  writeManifest,
  type LoadedManifestData,
  type ProcessingManifest,
  type OldManifest,
  type OldManifestEntry,
  type Manifest,
  isManifest,
  // Entry types - using new names
  type V1BaseOutputMeta,
  type BaseOutputMeta,
  isV1BaseOutputMeta,
  isBaseOutputMeta,
  // Backward compatibility aliases
  type V1BaseOutputMeta as V1Entry,
  type BaseOutputMeta as V2Entry,
  isV1BaseOutputMeta as isV1Entry,
  isBaseOutputMeta as isV2Entry,
} from "./manifest-operations.js";

// Re-export for backward compatibility
export type { ProcessingManifest as ManifestMap } from "./manifest-operations.js";

// Low-level utilities
export {
  getOldManifest,
  getOldManifestWithFallback,
  type GetOldManifestFailureReason,
} from "./old-manifest.js";
