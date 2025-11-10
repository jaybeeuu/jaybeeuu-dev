import type { Result } from "@jaybeeuu/utilities";
import { failure, success } from "@jaybeeuu/utilities";
import { recurseDirectory } from "../../files/index.js";
import { contentResolverConfig } from "../content-types.js";

/**
 * Configuration for file discovery.
 */
export interface FileDiscoveryConfig {
  readonly sourceDir: string;
}

/**
 * Convert file extension patterns to RegExp patterns for file matching.
 *
 * @param patterns - Array of file extension patterns (e.g., [".md", ".post.md"])
 * @returns Array of RegExp patterns for matching files
 */
function createIncludePatterns(patterns: readonly string[]): RegExp[] {
  return patterns.map((pattern) => new RegExp(`\\${pattern}$`));
}

/**
 * Discover content files based on configured file patterns.
 *
 * Uses the content resolver configuration to determine which files to include
 * based on file extension patterns for different content types.
 *
 * @param config - File discovery configuration
 * @returns Promise resolving to array of file paths or failure
 */
export async function discoverContentFiles(
  config: FileDiscoveryConfig,
): Promise<Result<string[], string>> {
  try {
    const patterns: string[] = [];

    for (const resolverConfig of Object.values(contentResolverConfig)) {
      patterns.push(...resolverConfig.filePatterns.frontmatter);
      patterns.push(...resolverConfig.filePatterns.jsonMetadata);
    }

    const includePatterns = createIncludePatterns(patterns);

    const allFiles: string[] = [];

    try {
      for await (const fileInfo of recurseDirectory(config.sourceDir, {
        include: includePatterns,
      })) {
        allFiles.push(fileInfo.filePath);
      }
    } catch {
      // If source directory doesn't exist, return empty array
      return success([]);
    }

    return success(allFiles);
  } catch (error) {
    return failure(
      "file discovery failed",
      `Failed to find files: ${String(error)}`,
    );
  }
}
