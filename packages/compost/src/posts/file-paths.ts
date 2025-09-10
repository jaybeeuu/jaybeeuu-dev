import type { Result } from "@jaybeeuu/utilities";
import { assertIsNotNullish, failure, success } from "@jaybeeuu/utilities";
import path from "path";
import { getHash } from "../hash.js";

const ALLOWED_SLUG_FORMAT = "^[0-9A-Za-z-]{4,}$";

export type ValidateSlugFailureReason = "invalid slug";
export type ValidateSlugResult = Result<never, ValidateSlugFailureReason>;

export const validateSlug = (slug: string): ValidateSlugResult => {
  return new RegExp(ALLOWED_SLUG_FORMAT).test(slug)
    ? success()
    : failure(
        "invalid slug",
        `Slug "${slug}" does not match the allowed format: "${ALLOWED_SLUG_FORMAT}"`,
      );
};

export const getPostMarkdownFilePath = (
  metadataAbsolutePath: string,
  slug: string,
): string => {
  return path.join(metadataAbsolutePath, `${slug}.md`);
};

export const getCompiledPostFileName = (
  slug: string,
  fileContent: string,
): string => {
  const hashFragment = getHash(fileContent);
  return `${slug}-${hashFragment}.html`;
};

export const getSlug = (relativeFilePath: string): string => {
  const [slug] = path.basename(relativeFilePath).split(".", 1);
  assertIsNotNullish(slug);
  return slug;
};
