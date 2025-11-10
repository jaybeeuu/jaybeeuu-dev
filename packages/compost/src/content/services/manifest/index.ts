export {
  ManifestManager,
  type ProcessingManifest,
  type ManifestConfig,
  type V1ManifestFile,
  type V2ManifestFile,
  type LoadedManifestFile,
} from "./manifest-manager.js";

// Re-export for backward compatibility
export type { ProcessingManifest as ManifestMap } from "./manifest-manager.js";
export {
  getOldManifest,
  type GetOldManifestFailureReason,
} from "./old-manifest.js";
