import path from "node:path";
import getReadingTime from "reading-time";
import type { CheckedBy, TypePredicate } from "@jaybeeuu/is";
import {
  is,
  isIntersectionOf,
  isLiteral,
  isObject,
  isUnionOf,
} from "@jaybeeuu/is";
import { isV2Entry } from "./types.js";
import { getCompiledPostFileName } from "./file-paths.js";
import type { V2ManifestFile } from "./services/manifest/manifest-operations.js";
import { isV2ManifestFile } from "./services/manifest/manifest-operations.js";

/**
 * File patterns for content type detection.
 */
export interface ContentFilePatterns {
  /** Extensions for frontmatter-based content (e.g., [".post.md"]) */
  frontmatter: readonly string[];
  /** Extensions for JSON metadata + markdown content (e.g., [".md"]) */
  jsonMetadata: readonly string[];
  /** Suffix for JSON metadata files (e.g., ".post.json") */
  jsonSuffix: string;
}

/**
 * User-facing configuration definition for a content type.
 * Allows optional manifest fields that will be defaulted at runtime.
 *
 * @template Type - Content type identifier (must be string literal)
 * @template Metadata - Metadata interface (object with known properties)
 */
export interface ContentConfigDefinition<Type extends string, Metadata> {
  /** Content type identifier */
  readonly contentType: Type;

  /** Validator function for metadata */
  readonly validator: TypePredicate<Metadata>;

  /** File patterns for content type detection */
  readonly filePatterns: ContentFilePatterns;

  /** Generate slug from file path */
  readonly generateSlug: (filePath: string, sourceDir: string) => string;

  /** Generate output filename from slug and compiled HTML */
  readonly generateFileName: (slug: string, html: string) => string;

  /** Enhance metadata with computed fields */
  readonly getAdditionalMetadata: (
    metadata: Metadata,
    content: string,
  ) => { [key: string]: unknown };

  /** Whether this content type requires old manifest for change detection (default: true) */
  readonly requireOldManifest?: boolean;

  /** Custom manifest filename pattern (default: `${contentType}-manifest.json`) */
  readonly manifestFileName?: string;

  /** Output directory for this content type (default: "lib") */
  readonly outputDir?: string;

  /** Additional old manifest file locations for backward compatibility (default: []) */
  readonly oldManifestLocators?: string[];
}

/**
 * Complete runtime configuration for a content type.
 * All manifest fields are required and populated with defaults.
 *
 * @template Type - Content type identifier (must be string literal)
 * @template Metadata - Metadata interface (object with known properties)
 */
export interface ContentConfig<Type extends string, Metadata> {
  /** Content type identifier */
  readonly contentType: Type;

  /** Validator function for metadata */
  readonly validator: TypePredicate<Metadata>;

  /** File patterns for content type detection */
  readonly filePatterns: ContentFilePatterns;

  /** Generate slug from file path */
  readonly generateSlug: (filePath: string, sourceDir: string) => string;

  /** Generate output filename from slug and compiled HTML */
  readonly generateFileName: (slug: string, html: string) => string;

  /** Enhance metadata with computed fields */
  readonly getAdditionalMetadata: (
    metadata: Metadata,
    content: string,
  ) => { [key: string]: unknown };

  /** Whether this content type requires old manifest for change detection */
  readonly requireOldManifest: boolean;

  /** Manifest filename for this content type */
  readonly manifestFileName: string;

  /** Output directory for this content type */
  readonly outputDir: string;

  /** Old manifest file locations for backward compatibility */
  readonly oldManifestLocators: string[];
}

/**
 * Type-safe map of content types to their configuration definitions (user-facing).
 * Ensures each config matches its key and has proper typing.
 */
export type ContentConfigDefinitionMap<
  ConfigMap extends { [key: string]: ContentConfigDefinition<string, unknown> },
> = {
  readonly [K in keyof ConfigMap]: ConfigMap[K] extends ContentConfigDefinition<
    infer Type,
    infer Metadata
  >
    ? Type extends K
      ? ContentConfigDefinition<Type, Metadata>
      : never
    : never;
};

/**
 * Type-safe map of content types to their runtime configurations.
 * All manifest fields are required and populated.
 */
export type ContentConfigMap<
  ConfigMap extends { [key: string]: ContentConfig<string, unknown> },
> = {
  readonly [K in keyof ConfigMap]: ConfigMap[K] extends ContentConfig<
    infer Type,
    infer Metadata
  >
    ? Type extends K
      ? ContentConfig<Type, Metadata>
      : never
    : never;
};

/**
 * Extract content type identifiers from a configuration map.
 * Provides compile-time verification that types match their keys.
 */
export type ContentTypesFromConfig<Config> = keyof Config;

/**
 * Extract the metadata type map from a configuration map.
 * Maintains strict typing between content types and their metadata.
 */
export type MetadataMapFromConfig<Config> = {
  readonly [K in keyof Config]: Config[K] extends ContentConfig<
    string,
    infer Metadata
  >
    ? Metadata
    : never;
};

/**
 * Tech radar quadrant categories for technology classification.
 */
const techRadarQuadrantValidator = isUnionOf(
  isLiteral("languages"),
  isLiteral("tools"),
  isLiteral("techniques"),
  isLiteral("platforms"),
);
export type TechRadarQuadrant = CheckedBy<typeof techRadarQuadrantValidator>;

/**
 * Tech radar adoption rings indicating recommendation level.
 */
const techRadarRingValidator = isUnionOf(
  isLiteral("adopt"),
  isLiteral("trial"),
  isLiteral("assess"),
  isLiteral("hold"),
);
export type TechRadarRing = CheckedBy<typeof techRadarRingValidator>;

/**
 * Type-safe validator for post file metadata.
 * Represents the metadata from frontmatter or JSON files before compilation.
 */
export const isPostFileMetadata = isObject({
  title: is("string"),
  abstract: is("string"),
  publish: is("boolean"),
} as const);
export type PostFileMetadata = CheckedBy<typeof isPostFileMetadata>;

/**
 * Type-safe validator for tech radar file metadata.
 * Defines technology position and descriptive information.
 */
export const isTechRadarFileMetadata = isObject({
  title: is("string"),
  quadrant: techRadarQuadrantValidator,
  ring: techRadarRingValidator,
  description: is("string"),
  publish: is("boolean"),
} as const);
export type TechRadarFileMetadata = CheckedBy<typeof isTechRadarFileMetadata>;

/**
 * Reading time calculation result for posts.
 */
export const isReadingTime = isObject({
  text: is("string"),
  time: is("number"),
  words: is("number"),
  minutes: is("number"),
});
export type ReadingTime = CheckedBy<typeof isReadingTime>;

/**
 * Complete metadata interface for compiled post manifest entries.
 */
export const isPostManifestEntry = isIntersectionOf(
  isV2Entry,
  isPostFileMetadata,
  isObject({
    slug: is("string"),
    readingTime: isReadingTime,
  }),
);
export type PostManifestEntry = CheckedBy<typeof isPostManifestEntry>;

/**
 * Post manifest type with V2 structure and typed metadata.
 */
export type PostManifest = V2ManifestFile<PostManifestEntry>;
export const isPostManifest = isV2ManifestFile(isPostManifestEntry);

/**
 * Configuration for all supported content types.
 *
 * This is the single source of truth for content type definitions.
 * Types are inferred from this object to ensure compile-time type safety
 * while maintaining runtime validation and processing capabilities.
 *
 * @example
 * ```typescript
 * // TypeScript knows this will be ContentTypes = "post" | "tech-radar"
 * type MyContentTypes = ContentTypesFromConfig<typeof contentResolverConfig>;
 * ```
 */
export const contentResolverConfig = {
  post: {
    contentType: "post",
    validator: isPostFileMetadata,
    filePatterns: {
      frontmatter: [".post.md"],
      jsonMetadata: [".md"],
      jsonSuffix: ".post.json",
    },
    generateSlug: (filePath: string, sourceDir: string) => {
      const relativePath = path.relative(sourceDir, filePath);
      return path
        .basename(relativePath, path.extname(relativePath))
        .replace(/\.post$/, "");
    },
    generateFileName: (slug: string, html: string) => {
      return getCompiledPostFileName(slug, html);
    },
    getAdditionalMetadata: (_metadata: PostFileMetadata, content: string) => {
      const readingTime = getReadingTime(content);
      return { readingTime };
    },
    // Use defaults: requireOldManifest: true, manifestFileName: "post-manifest.json", outputDir: "lib"
  },
  "tech-radar": {
    contentType: "tech-radar",
    validator: isTechRadarFileMetadata,
    filePatterns: {
      frontmatter: [".tech.md", ".tech-radar.md"],
      jsonMetadata: [".md"],
      jsonSuffix: ".tech.json",
    },
    generateSlug: (filePath: string, sourceDir: string) => {
      const relativePath = path.relative(sourceDir, filePath);
      return path
        .basename(relativePath, path.extname(relativePath))
        .replace(/\.(tech|tech-radar)$/, "");
    },
    generateFileName: (slug: string) => {
      return `${slug}.html`;
    },
    getAdditionalMetadata: (
      metadata: TechRadarFileMetadata,
      content: string,
    ) => {
      const readingTime = getReadingTime(content);
      return {
        quadrant: metadata.quadrant,
        ring: metadata.ring,
        description: metadata.description,
        readingTime,
      };
    },
    // Custom manifest settings
    requireOldManifest: false, // Tech radar doesn't need change detection
    manifestFileName: "tech-radar-manifest.json", // Custom filename
  },
} as const;

// Now derive types from the actual config
export type ContentTypes = ContentTypesFromConfig<typeof contentResolverConfig>;
export type ContentMetadataMap = MetadataMapFromConfig<
  typeof contentResolverConfig
>;

// Type alias for backward compatibility with legacy imports
export type { ContentTypes as ContentType };

/**
 * Simplified content config types for threading through the system.
 * Uses any for metadata to eliminate complex generic constraints and allow
 * compatibility with existing strongly-typed configs.
 */
export type AnyContentConfigDefinition = ContentConfigDefinition<string, any>;
export type AnyContentConfigDefinitionMap = {
  [key: string]: AnyContentConfigDefinition;
};
export type AnyContentConfig = ContentConfig<string, any>;
export type AnyContentConfigMap = { [key: string]: AnyContentConfig };
