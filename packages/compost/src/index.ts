import type { Result } from "packages/utilities/lib/results.js";
import type {
  OrchestratorConfig,
  ManifestEntry as ProcessedManifestEntry,
  ProcessContentFailureReason,
} from "./content/orchestrator.js";
import { processContent } from "./content/orchestrator.js";
import type {
  Manifest as InternalManifest,
  BaseManifestEntry as BaseManifestEntry,
} from "./content/services/manifest/index.js";
import type { ContentTypeDefinition } from "./content/index.js";

export type Manifest<EntryType = BaseManifestEntry> =
  InternalManifest<EntryType>;
export type { BaseManifestEntry as ManifestEntry };

export type {
  CompostConfig,
  ContentTypeDefinition,
  BaseInputMetadata,
  OrchestratorConfig,
} from "./content/index.js";
export {
  createCompostConfig,
  createContentType,
  processContent,
} from "./content/index.js";

export type ContentTypeDefinitionMap = {
  [ContentType in string]: ContentTypeDefinition<ContentType>;
};

export type CompostResult<Content extends ContentTypeDefinitionMap> = {
  [K in keyof Content]: Manifest<ProcessedManifestEntry<Content[K]>>;
};

/**
 * Compile content using Compost with the provided configuration.
 * This is the main programmatic API for Compost.
 *
 * @param {OrchestratorConfig} config - Configuration options for compilation (clean, etc.)
 * @param {ContentTypeDefs} contentConfigDefinitions - Content type definitions
 * @returns Promise resolving to manifest files for each content type
 */
export function compost<const ContentTypeDefs extends ContentTypeDefinitionMap>(
  config: OrchestratorConfig,
  contentConfigDefinitions: ContentTypeDefs,
): Promise<
  Result<CompostResult<ContentTypeDefs>, ProcessContentFailureReason>
> {
  return processContent(config, contentConfigDefinitions);
}
