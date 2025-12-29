import type { Result } from "@jaybeeuu/utilities";
import { failure, joinUrlPath, success } from "@jaybeeuu/utilities";
import path from "node:path";
import { copyFile, writeTextFile } from "../../files/index.js";
import { getHash } from "./hash.js";
import {
  type BaseInputMetadata,
  type ContentDefinition,
  type ContentDefManifestEntry,
  type CustomManifestEntryProperties,
  isBaseInputMetadata,
} from "../content-definition.js";
import { resolveContent } from "./content-resolver.js";
import { type BaseManifestEntry } from "../../manifest.js";
import {
  detectContentChange,
  type OldManifestEntries,
} from "./manifest/index.js";
import { compileMarkdown } from "./markdown-compilation.js";
import { getErrorMessage } from "@jaybeeuu/utilities";
export interface ProcessedContent<ContentDef extends ContentDefinition> {
  slug: string;
  manifestEntry: ContentDefManifestEntry<ContentDef>;
}

export type ProcessTypedContentFailureReason =
  | "content skipped"
  | "compilation failed";

async function writeTypedCompiledContent(
  fileName: string,
  html: string,
  assets: Array<{ sourcePath: string; destinationPath: string }>,
  contentDef: ContentDefinition,
): Promise<void> {
  const htmlPath = path.join(contentDef.outputDir, fileName);
  await writeTextFile(htmlPath, html);

  await Promise.all(
    assets.map((asset) =>
      copyFile(
        asset.sourcePath,
        path.join(contentDef.outputDir, asset.destinationPath),
      ),
    ),
  );
}

async function processTypedContent<ContentDef extends ContentDefinition>(
  inputMetadata: BaseInputMetadata,
  content: string,
  filePath: string,
  oldManifestEntries: OldManifestEntries,
  contentDef: ContentDef,
): Promise<
  Result<ProcessedContent<ContentDef>, ProcessTypedContentFailureReason>
> {
  // Check if content should be published (filtering based on input metadata)
  if (!inputMetadata.publish && !contentDef.includeUnpublished) {
    return failure("content skipped", "Content is not published");
  }

  const hash = getHash(content + JSON.stringify(inputMetadata));

  const slug = contentDef.generateSlug({
    filePath,
    sourceDir: contentDef.sourceDir,
    hash,
    html: content,
  });

  const compileResult = await compileContent(filePath, content, contentDef);
  if (!compileResult.success) {
    return failure(
      "compilation failed",
      `Failed to compile ${contentDef.contentType}: ${compileResult.message}`,
    );
  }

  const { html: compiledHtml, assets } = compileResult.value;

  const customManifestEntryProperties = contentDef.mapToManifestEntry(
    inputMetadata,
    content,
  ) as CustomManifestEntryProperties<ContentDef>;

  const manifestEntry: BaseManifestEntry = generateManifestEntry({
    slug,
    filePath,
    title: inputMetadata.title,
    customManifestEntryProperties,
    compiledHtml,
    hash,
    oldManifest: oldManifestEntries,
    contentDef,
  });

  await writeTypedCompiledContent(
    manifestEntry.fileName,
    compiledHtml,
    assets,
    contentDef,
  );

  return success({
    slug,
    manifestEntry,
  } as ProcessedContent<ContentDef>);
}

export type ProcessFileFailureReason =
  | "content resolution failed"
  | "content type not configured"
  | "content skipped"
  | "compilation failed"
  | "file processing failed";

export const processFile = async <ContentDef extends ContentDefinition>({
  filePath,
  oldManifest,
  contentDef,
}: {
  filePath: string;
  oldManifest: OldManifestEntries;
  contentDef: ContentDef;
}): Promise<
  Result<ProcessedContent<ContentDef> | null, ProcessFileFailureReason>
> => {
  try {
    const contentResult = await resolveContent(filePath, contentDef);
    if (!contentResult.success) {
      // Skip files with no metadata
      if (
        contentResult.reason === "no frontmatter in markdown file" ||
        contentResult.reason === "json file not found"
      ) {
        return success(null);
      }
      return failure(
        "content resolution failed",
        `${contentResult.reason}: ${contentResult.message}`,
      );
    }

    // Validate input metadata: both user-defined and base metadata must be valid
    if (
      !contentDef.validateInputMeta(contentResult.value.metadata) ||
      !isBaseInputMetadata(contentResult.value.metadata)
    ) {
      return failure("content resolution failed", "Invalid metadata structure");
    }

    const result = await processTypedContent(
      contentResult.value.metadata,
      contentResult.value.content,
      filePath,
      oldManifest,
      contentDef,
    );
    if (!result.success) {
      if (result.reason === "content skipped") {
        return success(null);
      }
      return result;
    }

    return success(result.value);
  } catch (error) {
    return failure(
      "file processing failed",
      `Failed to process file ${filePath}: ${getErrorMessage(error)}`,
    );
  }
};

export type CompileContentFailureReason = "compilation failed";

async function compileContent(
  filePath: string,
  content: string,
  contentDef: ContentDefinition,
): Promise<
  Result<
    {
      html: string;
      assets: Array<{ sourcePath: string; destinationPath: string }>;
    },
    CompileContentFailureReason
  >
> {
  const result = await compileMarkdown({
    sourceFilePath: filePath,
    sourceFileText: content,
    hrefRoot: contentDef.hrefRoot,
    codeLineNumbers: contentDef.codeLineNumbers,
    removeH1: contentDef.removeH1,
  });

  if (!result.success) {
    return failure("compilation failed", result.message);
  }

  return success(result.value);
}

const resolveLastUpdateDate = ({
  oldEntry,
  hasBeenUpdated,
}: {
  oldEntry?: { lastUpdateDate: string | null };
  hasBeenUpdated: boolean;
}): string | null => {
  if (!oldEntry) {
    return null;
  }

  if (hasBeenUpdated) {
    return new Date().toISOString();
  }

  return oldEntry.lastUpdateDate
    ? new Date(oldEntry.lastUpdateDate).toISOString()
    : null;
};

function generateManifestEntry<ContentDef extends ContentDefinition>({
  slug,
  filePath,
  customManifestEntryProperties,
  title,
  compiledHtml,
  hash,
  oldManifest,
  contentDef,
}: {
  slug: string;
  filePath: string;
  customManifestEntryProperties: CustomManifestEntryProperties<ContentDef>;
  title: string;
  compiledHtml: string;
  hash: string;
  oldManifest: OldManifestEntries;
  contentDef: ContentDef;
}): ContentDefManifestEntry<ContentDef> {
  const fileName = contentDef.generateFileName({
    slug,
    filePath,
    sourceDir: contentDef.sourceDir,
    hash,
    html: compiledHtml,
  });
  const href = joinUrlPath(contentDef.hrefRoot, fileName);

  const oldEntry = oldManifest[slug];

  const publishDate = new Date(
    oldEntry?.publishDate ?? new Date(),
  ).toISOString();

  const hasBeenUpdated = detectContentChange(oldEntry, fileName, hash);

  const lastUpdateDate = resolveLastUpdateDate({
    hasBeenUpdated,
    oldEntry,
  });
  const result: ContentDefManifestEntry<ContentDef> = Object.assign(
    {},
    customManifestEntryProperties,
    {
      fileName,
      href,
      title,
      publishDate,
      lastUpdateDate,
      hash,
      slug,
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return result;
}
