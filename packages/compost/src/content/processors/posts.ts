import type { Result } from "@jaybeeuu/utilities";
import { success, failure } from "@jaybeeuu/utilities";
import type {
  CompiledContent,
  GlobalConfig,
  ContentTypeConfig,
} from "../types.js";
import type { PostData } from "./posts/post-resolver.js";
import { resolvePost } from "./posts/post-resolver.js";
import { compilePost } from "../compile.js";
import { getOldManifest } from "../manifest.js";
import path from "path";

/**
 * Posts-specific handler implementation
 *
 * Note: This is a bridge implementation that doesn't fully implement ContentTypeHandler
 * because it needs to return PostData (metadata + content) rather than just metadata.
 * This will be refactored when we move to processor-managed content loading.
 */
export class PostsHandler {
  private globalConfig: GlobalConfig;
  private contentTypeConfig: ContentTypeConfig;

  constructor(
    globalConfig: GlobalConfig,
    contentTypeConfig: ContentTypeConfig,
  ) {
    this.globalConfig = globalConfig;
    this.contentTypeConfig = contentTypeConfig;
  }

  get contentType(): "posts" {
    return "posts" as const;
  }

  canHandle(filePath: string): boolean {
    // Handle both .post.md files and .md files with corresponding .post.json
    return (
      filePath.endsWith(".post.md") ||
      (filePath.endsWith(".md") && !filePath.endsWith(".post.md"))
    );
  }

  async parseMetadata(filePath: string): Promise<Result<PostData, string>> {
    // Use existing posts logic for metadata parsing - return the full PostData
    return await resolvePost(filePath);
  }

  validateMetadata(metadata: unknown): metadata is PostData {
    // Basic validation - the resolvePost function already handles detailed validation
    if (!metadata || typeof metadata !== "object") {
      return false;
    }

    const obj = metadata as { [key: string]: unknown };
    return (
      "content" in obj &&
      "metadata" in obj &&
      typeof obj.content === "string" &&
      typeof obj.metadata === "object" &&
      obj.metadata !== null
    );
  }

  async compile(options: {
    sourceFilePath: string;
    sourceFileText: string;
    metadata: PostData;
  }): Promise<Result<CompiledContent, string>> {
    // Use existing posts compilation logic
    const compileResult = await compilePost({
      sourceFilePath: options.sourceFilePath,
      sourceFileText: options.sourceFileText, // Use the provided source text
      hrefRoot: this.globalConfig.hrefRoot,
      codeLineNumbers: this.globalConfig.codeLineNumbers,
      removeH1: this.globalConfig.removeH1,
    });

    if (!compileResult.success) {
      return compileResult;
    }

    // Convert to shared CompiledContent format
    const { html, assets } = compileResult.value;
    return success({
      html,
      assets,
    });
  }

  async loadOldManifest(): Promise<Result<{ [key: string]: unknown }, string>> {
    const outputDir =
      this.contentTypeConfig.outputDir ?? this.globalConfig.outputDir;
    const manifestName =
      this.contentTypeConfig.manifestName ?? "posts-manifest.json";
    const manifestPath = path.join(outputDir, manifestName);
    const manifestLocators = this.contentTypeConfig.manifestLocator ?? [];

    const result = await getOldManifest(manifestPath, manifestLocators);
    if (!result.success) {
      return failure("manifest-load-failure", result.message);
    }
    return success(result.value as { [key: string]: unknown });
  }

  async saveManifest(manifest: {
    [key: string]: unknown;
  }): Promise<Result<void, string>> {
    const outputDir =
      this.contentTypeConfig.outputDir ?? this.globalConfig.outputDir;
    const manifestName =
      this.contentTypeConfig.manifestName ?? "posts-manifest.json";
    const manifestPath = path.resolve(outputDir, manifestName);

    const { writeJsonFile } = await import("../../files/index.js");
    try {
      await writeJsonFile(manifestPath, manifest);
      return success(undefined);
    } catch (error) {
      return failure(
        "file-write-error",
        `Failed to write manifest: ${String(error)}`,
      );
    }
  }
}

/**
 * Factory for creating PostsHandler instances with configuration
 */
export class PostsHandlerFactory {
  readonly contentType = "posts" as const;

  create(
    globalConfig: GlobalConfig,
    contentTypeConfig: ContentTypeConfig,
  ): PostsHandler {
    return new PostsHandler(globalConfig, contentTypeConfig);
  }
}
