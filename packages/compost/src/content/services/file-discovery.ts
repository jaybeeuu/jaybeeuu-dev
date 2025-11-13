import type { Result } from "@jaybeeuu/utilities";
import { failure, success } from "@jaybeeuu/utilities";

export type DiscoverFilesFailureReason = "file discovery failed";

export async function discoverFilesForContentType(
  sourceDir: string,
  filePatterns: {
    frontmatter: readonly string[];
    jsonMetadata: readonly string[];
    jsonSuffix: string;
  },
): Promise<Result<string[], DiscoverFilesFailureReason>> {
  try {
    const { recurseDirectory } = await import("../../files/index.js");
    const patterns = [
      ...filePatterns.frontmatter,
      ...filePatterns.jsonMetadata,
    ];
    const includePatterns = patterns.map(
      (pattern) => new RegExp(pattern.replace(/\./g, "\\.") + "$"),
    );

    const files: string[] = [];

    try {
      for await (const fileInfo of recurseDirectory(sourceDir, {
        include: includePatterns,
      })) {
        files.push(fileInfo.filePath);
      }
    } catch {
      // If source directory doesn't exist, return empty array
      return success([]);
    }

    return success(files);
  } catch (error) {
    return failure(
      "file discovery failed",
      `Failed to discover files for content type: ${error}`,
    );
  }
}
