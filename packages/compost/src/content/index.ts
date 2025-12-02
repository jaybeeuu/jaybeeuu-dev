export { parseYamlMeta } from "./services/metadata.js";
export type { ParseYamlMetaFailureReason } from "./services/metadata.js";
export { resolveContent } from "./services/content-resolver.js";
export type {
  ResolvedContent,
  ResolveContentFailureReason,
} from "./services/content-resolver.js";
export { processContent } from "./orchestrator.js";
export type { OrchestratorConfig } from "./orchestrator.js";
export type { Manifest, BaseManifestEntry } from "./services/manifest/index.js";
export type {
  CompostConfig,
  ContentTypeDefinition,
  ContentTypeDefinitionInput,
  BaseInputMeta as BaseInputMetadata,
} from "./content-types.js";
export {
  validateCompostConfig,
  createCompostConfig,
  createContentType,
  createSimpleContentType,
  identityMapping,
  createMapping,
} from "./content-types.js";
