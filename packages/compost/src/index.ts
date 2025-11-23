import type { Result } from "packages/utilities/lib/results.js";
import type {
  OrchestratorConfig,
  ManifestEntry,
  ProcessContentFailureReason,
} from "./content/orchestrator.js";
import { processContent } from "./content/orchestrator.js";
import type { V2ManifestFile } from "./content/services/manifest/index.js";

export type {
  CompostConfig,
  ContentTypeDefinition,
  BaseInputMetadata,
  OrchestratorConfig,
} from "./content/index.js";
export { createCompostConfig, processContent } from "./content/index.js";

/**
 * Compile content using Compost with the provided configuration.
 * This is the main programmatic API for Compost.
 *
 * @param {OrchestratorConfig} config - Configuration options for compilation (clean, etc.)
 * @param {ContentTypeDefs} contentConfigDefinitions - Content type definitions
 * @returns Promise resolving to manifest files for each content type
 */
export function compost<
  // Note: Using `any` here is necessary for generic variance compatibility.
  // ContentTypeDefinition has complex generic constraints that make strict typing impractical.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ContentTypeDefs extends { [key: string]: any },
>(
  config: OrchestratorConfig,
  contentConfigDefinitions: ContentTypeDefs,
): Promise<
  Result<
    {
      [K in keyof ContentTypeDefs]: V2ManifestFile<
        ManifestEntry<ContentTypeDefs[K]>
      >;
    },
    ProcessContentFailureReason
  >
> {
  return processContent(config, contentConfigDefinitions);
}
