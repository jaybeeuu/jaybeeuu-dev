// Legacy update function - use processContent from orchestrator instead
// Note: Metadata type has been simplified - export specific types instead
export { parseYamlMeta } from "./services/metadata.js";
export type { ParseYamlMetaFailureReason } from "./services/metadata.js";
export type {
  PostManifest,
  PostManifestEntry,
  PostManifestEntry as PostMetadata,
  PostFileMetadata,
  ReadingTime,
} from "./content-types.js";
export { resolveContent } from "./services/content-resolver.js";
export type {
  ResolvedContent,
  ResolveContentFailureReason,
} from "./services/content-resolver.js";
export { contentResolverConfig } from "./content-types.js";
export { processContent } from "./orchestrator.js";
export type { ProcessedContent, OrchestratorConfig } from "./orchestrator.js";
