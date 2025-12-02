export {
  buildManifest,
  writeManifest,
  type LoadedManifestData,
  type ProcessingManifest,
  type Manifest,
  isManifest,
  type BaseOutputMeta as BaseManifestEntry,
  shouldTreatEntryAsChanged,
  getUpgradedV1EntryHash,
} from "./manifest-operations.js";

export {
  getOldManifestWithFallback,
  type GetOldManifestFailureReason,
} from "./old-manifest.js";
