import path from "node:path";
import getReadingTime from "reading-time";
import type { CheckedBy, TypePredicate } from "@jaybeeuu/is";
import {
  is,
  isIntersectionOf,
  isLiteral,
  isObject,
  isRecordOf,
  isUnionOf,
} from "@jaybeeuu/is";
import { isV2Entry } from "./types.js";
import { getCompiledPostFileName } from "./file-paths.js";
import type { V2ManifestFile } from "./services/manifest/manifest-manager.js";
import { isV2ManifestFile } from "./services/manifest/manifest-manager.js";

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
 * Complete configuration for a content type.
 * Combines resolution, processing, and output generation capabilities.
 *
 * @template Type - Content type identifier (must be string literal)
 * @template MetaData - Metadata interface (object with known properties)
 */
export interface ContentConfig<Type extends string, MetaData> {
  /** Content type identifier */
  readonly contentType: Type;

  /** Validator function for metadata */
  readonly validator: TypePredicate<MetaData>;

  /** File patterns for content type detection */
  readonly filePatterns: ContentFilePatterns;

  /** Generate slug from file path */
  readonly generateSlug: (filePath: string, sourceDir: string) => string;

  /** Generate output filename from slug and compiled HTML */
  readonly generateFileName: (slug: string, html: string) => string;

  /** Enhance metadata with computed fields */
  readonly enhanceMetadata: (
    metadata: MetaData,
    content: string,
  ) => { [key: string]: unknown };
}

/**
 * Type-safe map of content types to their configurations.
 * Ensures each config matches its key and has proper typing.
 */
export type ContentConfigMap<
  ConfigMap extends { [key: string]: ContentConfig<string, unknown> },
> = {
  readonly [K in keyof ConfigMap]: ConfigMap[K] extends ContentConfig<
    infer Type,
    infer MetaData
  >
    ? Type extends K
      ? ContentConfig<Type, MetaData>
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
    infer MetaData
  >
    ? MetaData
    : never;
};

/**
 * Metadata interface for post source files.
 * Represents the metadata from frontmatter or JSON files before compilation.
 */
export interface PostMetaFileData {
  readonly title: string;
  readonly abstract: string;
  readonly publish: boolean;
}

/**
 * Tech radar quadrant categories for technology classification.
 */
export type TechRadarQuadrant =
  | "languages"
  | "tools"
  | "techniques"
  | "platforms";

/**
 * Tech radar adoption rings indicating recommendation level.
 */
export type TechRadarRing = "adopt" | "trial" | "assess" | "hold";

/**
 * Metadata interface for tech radar entry source files.
 * Defines technology position and descriptive information.
 */
export interface TechRadarMetaFileData {
  readonly title: string;
  readonly quadrant: TechRadarQuadrant;
  readonly ring: TechRadarRing;
  readonly description: string;
  readonly publish: boolean;
}

/**
 * Type-safe validator for post metadata.
 * Ensures runtime validation matches compile-time types.
 */
export const isPostMetaData = isObject<PostMetaFileData>({
  title: is("string"),
  abstract: is("string"),
  publish: is("boolean"),
} as const);

/**
 * Type-safe validator for tech radar metadata.
 * Ensures runtime validation matches compile-time types.
 */
export const isTechRadarMetaData = isObject<TechRadarMetaFileData>({
  title: is("string"),
  quadrant: isUnionOf(
    isLiteral("languages"),
    isLiteral("tools"),
    isLiteral("techniques"),
    isLiteral("platforms"),
  ) satisfies TypePredicate<TechRadarQuadrant>,
  ring: isUnionOf(
    isLiteral("adopt"),
    isLiteral("trial"),
    isLiteral("assess"),
    isLiteral("hold"),
  ) satisfies TypePredicate<TechRadarRing>,
  description: is("string"),
  publish: is("boolean"),
} as const);

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
 * Complete metadata interface for compiled posts.
 */
export const isPostMetadata = isIntersectionOf(
  isV2Entry,
  isObject({
    abstract: is("string"),
    slug: is("string"),
    title: is("string"),
    publish: is("boolean"),
    readingTime: isReadingTime,
  }),
);
export type PostMetadata = CheckedBy<typeof isPostMetadata>;

/**
 * Post manifest type with V2 structure and typed metadata.
 */
export type PostManifest = V2ManifestFile<PostMetadata>;
export const isPostManifest = isV2ManifestFile(isPostMetadata);

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
export const contentResolverConfig: {
  readonly post: ContentConfig<"post", PostMetaFileData>;
  readonly "tech-radar": ContentConfig<"tech-radar", TechRadarMetaFileData>;
} = {
  post: {
    contentType: "post",
    validator: isPostMetaData,
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
    enhanceMetadata: (_metadata: PostMetaFileData, content: string) => {
      const readingTime = getReadingTime(content);
      return { readingTime };
    },
  },
  "tech-radar": {
    contentType: "tech-radar",
    validator: isTechRadarMetaData,
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
    enhanceMetadata: (metadata: TechRadarMetaFileData, _content: string) => {
      return {
        quadrant: metadata.quadrant,
        ring: metadata.ring,
        description: metadata.description,
      };
    },
  },
};

// Now derive types from the actual config
export type ContentTypes = ContentTypesFromConfig<typeof contentResolverConfig>;
export type ContentMetaDataMap = MetadataMapFromConfig<
  typeof contentResolverConfig
>;

// Type alias for backward compatibility with legacy imports
export type { ContentTypes as ContentType };

/**
 * Simplified content config types for threading through the system.
 * Uses any for metadata to eliminate complex generic constraints and allow
 * compatibility with existing strongly-typed configs.
 */
export type AnyContentConfig = ContentConfig<string, any>;
export type AnyContentConfigMap = { [key: string]: AnyContentConfig };
