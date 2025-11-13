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

export interface ContentFilePatterns {
  frontmatter: readonly string[];
  jsonMetadata: readonly string[];
  jsonSuffix: string;
}

export interface ContentTypeDefinition<
  Type extends string,
  Metadata extends { [key: string]: unknown },
  CalculatedMetadata extends { [key: string]: unknown },
> {
  readonly contentType: Type;
  readonly validator: TypePredicate<Metadata>;
  readonly filePatterns: ContentFilePatterns;
  readonly generateSlug: (filePath: string, sourceDir: string) => string;
  readonly generateFileName: (slug: string, html: string) => string;
  readonly getAdditionalMetadata: (
    metadata: Metadata,
    content: string,
  ) => CalculatedMetadata;
  readonly requireOldManifest?: boolean;
  readonly manifestFileName?: string;
  readonly sourceDir?: string;
  readonly outputDir?: string;
  readonly oldManifestLocators?: string[];
  readonly hrefRoot: string;
  readonly includeUnpublished: boolean;
  readonly codeLineNumbers: boolean;
  readonly removeH1: boolean;
}

/**
 * ResolvedContentDefinition is derived directly from a ContentTypeDefinition with all optional fields filled in.
 * This represents the configuration after applying defaults.
 */
export type ResolvedContentDefinition<TDefinition> =
  TDefinition extends ContentTypeDefinition<
    infer Type,
    infer Metadata,
    infer CalculatedMetadata
  >
    ? Required<ContentTypeDefinition<Type, Metadata, CalculatedMetadata>>
    : never;

export type ResolvedContentDefinitionMap<
  ConfigMap extends {
    [key: string]: ContentTypeDefinition<
      string,
      { [key: string]: unknown },
      { [key: string]: unknown }
    >;
  },
> = {
  readonly [K in keyof ConfigMap]: ResolvedContentDefinition<ConfigMap[K]>;
};

export type ContentTypesFromConfig<Config> = keyof Config;

export type MetadataMapFromConfig<Config> = {
  readonly [K in keyof Config]: Config[K] extends ContentTypeDefinition<
    string,
    infer Metadata,
    { [key: string]: unknown }
  >
    ? Metadata
    : never;
};

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

export type PostManifest = V2ManifestFile<PostManifestEntry>;
export const isPostManifest = isV2ManifestFile(isPostManifestEntry);

/**
 * Complete metadata interface for compiled tech radar manifest entries.
 */
export const isTechRadarManifestEntry = isIntersectionOf(
  isV2Entry,
  isTechRadarFileMetadata,
  isObject({
    slug: is("string"),
    readingTime: isReadingTime,
  }),
);
export type TechRadarManifestEntry = CheckedBy<typeof isTechRadarManifestEntry>;

export type TechRadarManifest = V2ManifestFile<TechRadarManifestEntry>;
export const isTechRadarManifest = isV2ManifestFile(isTechRadarManifestEntry);

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
    sourceDir: "src",
    outputDir: "out",
    hrefRoot: "/",
    includeUnpublished: false,
    codeLineNumbers: false,
    removeH1: false,
  } satisfies ContentTypeDefinition<
    "post",
    PostFileMetadata,
    { readingTime: ReadingTime }
  >,
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
    requireOldManifest: false,
    manifestFileName: "tech-radar-manifest.json",
    sourceDir: "src",
    outputDir: "out",
    hrefRoot: "/",
    includeUnpublished: false,
    codeLineNumbers: false,
    removeH1: false,
  } satisfies ContentTypeDefinition<
    "tech-radar",
    TechRadarFileMetadata,
    {
      quadrant: TechRadarQuadrant;
      ring: TechRadarRing;
      description: string;
      readingTime: ReadingTime;
    }
  >,
} as const;

export type ContentTypes = ContentTypesFromConfig<typeof contentResolverConfig>;
export type ContentMetadataMap = MetadataMapFromConfig<
  typeof contentResolverConfig
>;

export type { ContentTypes as ContentType };

export type AnyResolvedContentDefinition = ResolvedContentDefinition<
  ContentTypeDefinition<
    string,
    { [key: string]: unknown },
    { [key: string]: unknown }
  >
>;

// Legacy aliases for backward compatibility
export type ContentConfig<TDefinition> = ResolvedContentDefinition<TDefinition>;
export type AnyContentConfig = AnyResolvedContentDefinition;
export type ContentConfigMap<
  T extends {
    [key: string]: ContentTypeDefinition<
      string,
      { [key: string]: unknown },
      { [key: string]: unknown }
    >;
  },
> = ResolvedContentDefinitionMap<T>;
export type AnyContentConfigMap = { [key: string]: AnyContentConfig };
