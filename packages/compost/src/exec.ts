import { type Result } from "packages/utilities/lib/results.js";
import {
  type ContentDefinition,
  type ContentDefManifest,
  type ProcessContentFailureReason,
  type OrchestratorConfig,
} from "./config.js";

export type CompostResult<ContentDef extends ContentDefinition> = Result<
  ContentDefManifest<ContentDef>,
  ProcessContentFailureReason
>;

/**
 * Compile content using Compost with the provided configuration.
 * This is the main programmatic API for Compost.
 *
 * @param {OrchestratorConfig} orchestratorConfig - Configuration options for compilation (clean, etc.)
 * @param {ContentDefs} contentDefinition - Content type definitions
 * @returns Promise resolving to manifest files for each content type
 */
export async function compost<const ContentDef extends ContentDefinition>(
  contentDefinition: ContentDef,
  orchestratorConfig: OrchestratorConfig,
): Promise<CompostResult<ContentDef>> {
  const { processContent } = await import("./content/index.js");

  return processContent(contentDefinition, orchestratorConfig);
}
