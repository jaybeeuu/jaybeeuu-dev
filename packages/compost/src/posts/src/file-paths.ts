import path from "path";
import { getHash } from "../../hash.js";
import type { Result } from "../../results.js";
import { success, failure } from "../../results.js";

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
  const hashFragment = getHash(fileContent);
  return `${slug}-${hashFragment}.html`;
};
