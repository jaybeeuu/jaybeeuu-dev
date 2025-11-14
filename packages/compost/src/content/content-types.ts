import path from "node:path";
import getReadingTime from "reading-time";
import type { CheckedBy } from "@jaybeeuu/is";
import { is, isLiteral, isObject, isUnionOf } from "@jaybeeuu/is";
import { type V2Entry } from "./services/manifest/index.js";
import { getCompiledPostFileName } from "./file-paths.js";
import type { V2ManifestFile } from "./services/manifest/manifest-operations.js";

/**
 * Base input metadata interface that all content types must extend.
 * Contains the minimum required fields for content processing.
 */
export interface BaseInputMetadata {
  /** Title of the content */
  title: string;
  /** Whether content should be published (used for filtering, not stored in output) */
  publish: boolean;
  [key: string]: unknown;
}

export interface ContentFilePatterns {
  frontmatter: readonly string[];
  jsonMetadata: readonly string[];
  jsonSuffix: string;
}

export interface ContentTypeDefinition<
  Type extends string,
  InputMeta extends { [key: string]: unknown },
  OutputMeta extends { [key: string]: unknown },
> {
  readonly contentType: Type;
  readonly filePatterns: ContentFilePatterns;
  readonly generateSlug: (filePath: string, sourceDir: string) => string;
  readonly generateFileName: (slug: string, html: string) => string;

  /** Validates raw input data from frontmatter/JSON files and intersects with BaseInputMetadata */
  readonly validateInputMeta: (
    data: unknown,
  ) => (InputMeta & BaseInputMetadata) | false;

  /** Maps validated input metadata and content to output metadata. If not provided, all InputMeta fields will be merged into output */
  readonly mapToOutputMeta?: (
    input: InputMeta & BaseInputMetadata,
    content: string,
  ) => OutputMeta;

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
    infer InputMeta,
    infer OutputMeta
  >
    ? Required<ContentTypeDefinition<Type, InputMeta, OutputMeta>>
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
    infer InputMeta,
    { [key: string]: unknown }
  >
    ? InputMeta & BaseInputMetadata
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
 * Input metadata for post files (from frontmatter/JSON).
 */
export const isPostInputMetadata = isObject({
  title: is("string"),
  abstract: is("string"),
  publish: is("boolean"),
} as const);
export type PostInputMetadata = CheckedBy<typeof isPostInputMetadata>;

/**
 * @deprecated Use PostInputMetadata instead
 */
export const isPostFileMetadata = isPostInputMetadata;
export type PostFileMetadata = PostInputMetadata;

/**
 * Input metadata for tech radar files (from frontmatter/JSON).
 */
export const isTechRadarInputMetadata = isObject({
  title: is("string"),
  quadrant: techRadarQuadrantValidator,
  ring: techRadarRingValidator,
  description: is("string"),
  publish: is("boolean"),
} as const);
export type TechRadarInputMetadata = CheckedBy<typeof isTechRadarInputMetadata>;

/**
 * @deprecated Use TechRadarInputMetadata instead
 */
export const isTechRadarFileMetadata = isTechRadarInputMetadata;
export type TechRadarFileMetadata = TechRadarInputMetadata;

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
 * Output metadata for posts (goes into manifest entries).
 * This is what gets stored after processing and transformation.
 */
export interface PostOutputMetadata extends Record<string, unknown> {
  title: string;
  abstract: string;
  readingTime: ReadingTime;
}

/**
 * Output metadata for tech radar items (goes into manifest entries).
 */
export interface TechRadarOutputMetadata extends Record<string, unknown> {
  title: string;
  quadrant: TechRadarQuadrant;
  ring: TechRadarRing;
  description: string;
}

/**
 * Complete metadata interface for compiled post manifest entries.
 * Combines V2Entry base fields with post-specific output metadata.
 */
export type PostManifestEntry = V2Entry & PostOutputMetadata;

export type PostManifest = V2ManifestFile<PostManifestEntry>;

/**
 * Complete metadata interface for compiled tech radar manifest entries.
 * Combines V2Entry base fields with tech radar-specific output metadata.
 */
export type TechRadarManifestEntry = V2Entry & TechRadarOutputMetadata;

export type TechRadarManifest = V2ManifestFile<TechRadarManifestEntry>;

export const contentResolverConfig = {
  post: {
    contentType: "post",
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
    validateInputMeta: (data: unknown) => {
      return isPostInputMetadata(data) ? data : false;
    },
    mapToOutputMeta: (input: PostInputMetadata, content: string) => {
      const readingTime = getReadingTime(content);
      return {
        title: input.title,
        abstract: input.abstract,
        readingTime,
      };
    },
    sourceDir: "src",
    outputDir: "out",
    hrefRoot: "/",
    includeUnpublished: false,
    codeLineNumbers: false,
    removeH1: false,
  } satisfies ContentTypeDefinition<
    "post",
    PostInputMetadata,
    PostOutputMetadata
  >,
  "tech-radar": {
    contentType: "tech-radar",
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
    validateInputMeta: (data: unknown) => {
      return isTechRadarInputMetadata(data) ? data : false;
    },
    mapToOutputMeta: (input: TechRadarInputMetadata) => {
      return {
        title: input.title,
        quadrant: input.quadrant,
        ring: input.ring,
        description: input.description,
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
    TechRadarInputMetadata,
    TechRadarOutputMetadata
  >,
} as const;
