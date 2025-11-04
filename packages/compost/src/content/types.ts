import type { CheckedBy } from "@jaybeeuu/is";
import { is, isObject, isUnionOf, isRecordOf } from "@jaybeeuu/is";
import type { FileInfo } from "../files/index.js";
import type { Result } from "@jaybeeuu/utilities";

// V1 Metadata Schema (legacy - no hash field)
export const isV1Metadata = isObject({
  fileName: is("string"),
  href: is("string"),
  lastUpdateDate: isUnionOf(is("string"), is("null")),
  publishDate: is("string"),
  // No hash field in v1
});
export type V1Metadata = CheckedBy<typeof isV1Metadata>;

// V2 Metadata Schema (current - includes hash field)
export const isV2Metadata = isObject({
  fileName: is("string"),
  href: is("string"),
  lastUpdateDate: isUnionOf(is("string"), is("null")),
  publishDate: is("string"),
  hash: is("string"), // Required in v2
});
export type V2Metadata = CheckedBy<typeof isV2Metadata>;

// Union type for all metadata (for backward compatibility)
export type Metadata = V1Metadata | V2Metadata;

// Generic manifest interface
export interface Manifest<Meta extends V1Metadata | V2Metadata> {
  [slug: string]: Meta;
}

// V1 Manifest Schema (direct entries, no version wrapper)
export const isV1Manifest = isRecordOf(isV1Metadata);
export type V1Manifest = CheckedBy<typeof isV1Manifest>;

// V2 Manifest Schema (versioned with metadata)
export const isV2ManifestEntries = isRecordOf(isV2Metadata);
export const isV2Manifest = isObject({
  version: is("number"),
  metadata: isObject({
    generatedAt: is("string"),
    entryCount: is("number"),
    overallHash: is("string"),
  }),
  entries: isV2ManifestEntries,
});
export type V2Manifest = CheckedBy<typeof isV2Manifest>;

// Legacy aliases for backward compatibility
export type OldMetadata = V1Metadata;
export type OldPostManifest = V1Manifest;
export const isOldPostMetaData = isV1Metadata;
export const isOldManifest = isV1Manifest;

export interface PostRedirectsMap {
  [oldHash: string]: string;
}

export interface UpdateOptions {
  additionalWatchPaths: string[];
  hrefRoot: string;
  includeUnpublished: boolean;
  codeLineNumbers: boolean;
  manifestFileName: string;
  oldManifestLocators: string[];
  outputDir: string;
  requireOldManifest: boolean;
  sourceDir: string;
  watch: boolean;
  removeH1: boolean;
  clean: boolean;
}

type ProcessingOutcomeSkipped<ProcessSkippedReason> = {
  outcome: "skipped";
  reason: ProcessSkippedReason;
};

type ProcessingOutcomeCompiled<Meta extends Metadata> = {
  outcome: "compiled";
  metadata: Meta;
};

export type ProcessingOutcome<Meta extends Metadata, ProcessSkippedReason> =
  | ProcessingOutcomeSkipped<ProcessSkippedReason>
  | ProcessingOutcomeCompiled<Meta>;

export interface PostUpdater<
  Meta extends Metadata,
  ProcessFailureReason extends string,
  ProcessSkippedReason extends string,
  PostProcessFailureReason extends string,
> {
  processFile: (
    fileInfo: FileInfo,
  ) => Promise<
    Result<ProcessingOutcome<Meta, ProcessSkippedReason>, ProcessFailureReason>
  >;
  postProcess: () => Promise<Result<void, PostProcessFailureReason>>;
  readonly newManifest: Manifest<Meta>;
}

export interface CompiledContent {
  html: string;
  assets: Array<{
    sourcePath: string;
    destinationPath: string;
  }>;
}

export interface GlobalConfig {
  hrefRoot: string;
  includeUnpublished: boolean;
  codeLineNumbers: boolean;
  outputDir: string;
  sourceDir: string;
  watch: boolean;
  removeH1: boolean;
  clean: boolean;
}

export interface ContentTypeConfig {
  outputDir?: string;
  manifestName?: string;
  manifestLocator?: string[];
}
