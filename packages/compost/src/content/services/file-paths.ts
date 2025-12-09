import { assertIsNotNullish } from "@jaybeeuu/utilities";
import path from "node:path";
import { getHash } from "../../hash.js";

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
