// Legacy update function - use processContent from orchestrator instead
// Note: Metadata type has been simplified - export specific types instead
export { parseYamlMeta } from "./services/metadata.js";
export type { ParseYamlMetaFailureReason } from "./services/metadata.js";
export { resolveContent } from "./services/content-resolver.js";
export type {
  ResolvedContent,
  ResolveContentFailureReason,
} from "./services/content-resolver.js";
export { processContent } from "./orchestrator.js";
export type { OrchestratorConfig } from "./orchestrator.js";
export type {
  Manifest as V2ManifestFile,
  BaseOutputMeta as ManifestEntry,
} from "./services/manifest/index.js";
export type {
  CompostConfig,
  ContentTypeDefinitionsFromConfig,
  ContentTypeDefinition,
  ContentTypeDefinitionInput,
  BaseInputMeta as BaseInputMetadata,
  InferContentTypes,
} from "./content-types.js";
export {
  validateCompostConfig,
  createCompostConfig,
  createContentType,
  createSimpleContentType,
  identityMapping,
  createMapping,
} from "./content-types.js";
