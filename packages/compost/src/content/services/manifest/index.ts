export {
  buildManifest,
  getUpgradedV1EntryHash,
  isManifest,
  shouldTreatEntryAsChanged,
  writeManifest,
  type BaseManifestEntry,
  type LoadedManifestData,
  type Manifest,
  type ManifestEntry,
  type ProcessingManifest,
} from "./manifest-operations.js";

export {
  getOldManifestWithFallback,
  type GetOldManifestFailureReason,
} from "./old-manifest.js";
