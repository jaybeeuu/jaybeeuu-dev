import { type Result } from "@jaybeeuu/utilities";
import {
  type OrchestratorConfig,
  type ProcessContentFailureReason,
  type ContentTypeDefinitionMap,
  type ContentTypeManifestMap,
  processContent,
} from "./content/index.js";

export {
  type ProcessContentFailureReason,
  type ContentTypeDefinitionMap,
  type ContentTypeManifestMap,
};
export { createCompostConfig } from "./content/index.js";
export {
  type BaseManifestEntry,
  isManifest,
  type Manifest,
  type ManifestEntry,
  type CompostConfig,
  type ContentTypeDefinition,
  type ContentTypeDefinitionInput,
  type BaseInputMetadata,
  type OrchestratorConfig,
} from "./content/index.js";

export type CompostResult<ContentDefs extends ContentTypeDefinitionMap> =
  Result<ContentTypeManifestMap<ContentDefs>, ProcessContentFailureReason>;

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
): Promise<CompostResult<ContentTypeDefs>> {
  return processContent(config, contentConfigDefinitions);
}
