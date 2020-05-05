import path from "path";
import { POSTS_DIST_DIRECTORY } from "../../paths";
import { getHash } from "../../utilities/hash";
import { success, failure, Result } from "../../results";

const HASH_LENGTH = 6;
const HASH_ALLOWED_CHARS = "0-9A-z";

const ALLOWED_SLUG_FORMAT = "[0-9A-z-]{4,}";
const POST_FILE_REGEXP = new RegExp(`${ALLOWED_SLUG_FORMAT}-[${HASH_ALLOWED_CHARS}]{${HASH_LENGTH}}.html`);

export const validateSlug = (slug: string): Result<void> => {
  return new RegExp(ALLOWED_SLUG_FORMAT).exec(slug)
    ? success()
    : failure(`Slug "${slug}" does not match the allowed format: "${ALLOWED_SLUG_FORMAT}"`);
};

export const getPostFileName = (slug: string, fileContent: string): string => {
  const compiledFileHash = getHash(fileContent);
  const hashFragment  = compiledFileHash.replace(
    new RegExp(`[^${HASH_ALLOWED_CHARS}]`, "g"),
    ""
  ).substring(0, HASH_LENGTH);
  return `${slug}-${hashFragment}.html`;
};

export const resolvePostFilePath = (name: string): string => {
  if (!POST_FILE_REGEXP.exec(name)) {
    throw new Error(`Invalid file name: ${name}`);
  }

  return path.join(POSTS_DIST_DIRECTORY, name);
}