import type { CheckedBy } from "@jaybeeuu/is";
import { is, isObject, isUnionOf, isRecordOf } from "@jaybeeuu/is";
import type { FileInfo } from "../files/index.js";
import type { Result } from "@jaybeeuu/utilities";

export const isMetadata = isObject({
  fileName: is("string"),
  href: is("string"),
  lastUpdateDate: isUnionOf(is("string"), is("null")),
  publishDate: is("string"),
});
export type Metadata = CheckedBy<typeof isMetadata>;

export interface Manifest<Meta extends Metadata> {
  [slug: string]: Meta;
}

export const isOldPostMetaData = isObject({
  fileName: is("string"),
  lastUpdateDate: isUnionOf(is("string"), is("null")),
  publishDate: is("string"),
});
export type OldMetadata = CheckedBy<typeof isOldPostMetaData>;

export const isOldManifest = isRecordOf(isOldPostMetaData);
export type OldPostManifest = CheckedBy<typeof isOldManifest>;

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
