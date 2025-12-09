import { type Result } from "@jaybeeuu/utilities";
import type { ContentDefManifest, ContentDefinition } from "./content/index.js";
import {
  type OrchestratorConfig,
  type ProcessContentFailureReason,
  processContent,
} from "./content/index.js";

export { type ProcessContentFailureReason };
export {
  type BaseManifestEntry,
  isManifest,
  type Manifest,
  type ManifestEntry,
  type ContentDefinition,
  type ContentDefinitionInput,
  type BaseInputMetadata,
  type OrchestratorConfig,
  createContentDefinition,
} from "./content/index.js";

export type CompostResult<ContentDef extends ContentDefinition> = Result<
  ContentDefManifest<ContentDef>,
  ProcessContentFailureReason
>;

/**
 * Compile content using Compost with the provided configuration.
 * This is the main programmatic API for Compost.
 *
 * @param {OrchestratorConfig} config - Configuration options for compilation (clean, etc.)
 * @param {ContentDefs} contentDefinition - Content type definitions
 * @returns Promise resolving to manifest files for each content type
 */
export function compost<const ContentDef extends ContentDefinition>(
  config: OrchestratorConfig,
  contentDefinition: ContentDef,
): Promise<CompostResult<ContentDef>> {
  return processContent(contentDefinition, config);
}
