import type { Result } from "packages/utilities/lib/results.js";
import type {
  OrchestratorConfig,
  ManifestEntry as ProcessedManifestEntry,
  ProcessContentFailureReason,
} from "./content/orchestrator.js";
import { processContent } from "./content/orchestrator.js";
import type {
  Manifest as InternalManifest,
  BaseOutputMeta as BaseManifestEntry,
} from "./content/services/manifest/index.js";
import type { ContentTypeDefinition } from "./content/index.js";

// Clean, version-agnostic public API types
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

/**
 * Compile content using Compost with the provided configuration.
 * This is the main programmatic API for Compost.
 *
 * @param {OrchestratorConfig} config - Configuration options for compilation (clean, etc.)
 * @param {ContentTypeDefs} contentConfigDefinitions - Content type definitions
 * @returns Promise resolving to manifest files for each content type
 */
export function compost<
  ContentTypeDefs extends {
    [key: string]: ContentTypeDefinition;
  },
>(
  config: OrchestratorConfig,
  contentConfigDefinitions: ContentTypeDefs,
): Promise<
  Result<
    {
      [K in keyof ContentTypeDefs]: Manifest<
        ProcessedManifestEntry<ContentTypeDefs[K]>
      >;
    },
    ProcessContentFailureReason
  >
> {
  return processContent(config, contentConfigDefinitions);
}
