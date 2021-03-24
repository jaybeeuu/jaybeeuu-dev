import path from "path";
import { getHash } from "../../hash";
import { success, failure, Result } from "../../results";

const HASH_LENGTH = 6;
const HASH_ALLOWED_CHARS = "0-9A-z";

const ALLOWED_SLUG_FORMAT = "[0-9A-z-]{4,}";

export type ValidateSlugFailureReason = "invalid slug"
export type ValidateSlugResult = Result<never, ValidateSlugFailureReason>;

export const validateSlug = (slug: string): ValidateSlugResult => {
  return new RegExp(ALLOWED_SLUG_FORMAT).exec(slug)
    ? success()
    : failure("invalid slug", `Slug "${slug}" does not match the allowed format: "${ALLOWED_SLUG_FORMAT}"`);
};

export const getPostMarkdownFilePath = (metadataAbsolutePath: string, slug: string): string =>  {
  return path.join(metadataAbsolutePath, `${slug}.md`);
};

export const getCompiledPostFileName = (slug: string, fileContent: string): string => {
  const compiledFileHash = getHash(fileContent);
  const hashFragment  = compiledFileHash.replace(
    new RegExp(`[^${HASH_ALLOWED_CHARS}]`, "g"),
    ""
  ).substring(0, HASH_LENGTH);
  return `${slug}-${hashFragment}.html`;
};
