// Legacy update function - use processContent from orchestrator instead
// Note: Metadata type has been simplified - export specific types instead
export { parseYamlMeta } from "./services/metadata.js";
export type { ParseYamlMetaFailureReason } from "./services/metadata.js";
export type {
  PostManifest,
  PostManifestEntry,
  PostManifestEntry as PostMetadata,
  PostInputMetadata,
  ReadingTime,
} from "../content-types/index.js";
export { resolveContent } from "./services/content-resolver.js";
export type {
  ResolvedContent,
  ResolveContentFailureReason,
} from "./services/content-resolver.js";
export { contentTypeDefinitions } from "../content-types/index.js";
export { processContent } from "./orchestrator.js";
export type { OrchestratorConfig } from "./orchestrator.js";
