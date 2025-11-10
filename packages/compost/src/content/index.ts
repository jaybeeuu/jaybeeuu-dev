// Legacy update function - use processContent from orchestrator instead
// Note: Metadata type has been simplified - export specific types instead
export { parseYamlMeta } from "./services/metadata.js";
export type { ParseYamlMetaFailureReason } from "./services/metadata.js";
// Export post-related types that may still be used externally
export type {
  PostManifest,
  PostMetadata,
  PostMetaFileData,
  ReadingTime,
} from "./content-types.js";
export { isPostManifest } from "./content-types.js";
export { resolveContent } from "./services/content-resolver.js";
export type {
  ContentResolverConfig,
  ResolvedContent,
  ResolveContentFailureReason,
} from "./services/content-resolver.js";
export type { ContentTypes, ContentMetaDataMap } from "./content-types.js";
export { contentResolverConfig } from "./content-types.js";
export { processContent } from "./orchestrator.js";
export type {
  ProcessedContent,
  ManifestMap,
  OrchestratorConfig,
} from "./orchestrator.js";
