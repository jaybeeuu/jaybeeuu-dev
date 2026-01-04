import { assertIsNotNullish } from "@jaybeeuu/utilities";
import path from "node:path";

export const getCompiledPostFileName = ({
  slug,
  hash,
}: {
  slug: string;
  hash: string;
}): string => {
  const hashFragment = hash.slice(0, 6);
  return `${slug}-${hashFragment}.html`;
};

export const getSlug = ({ filePath }: { filePath: string }): string => {
  const [slug] = path.basename(filePath).split(".", 1);
  assertIsNotNullish(slug);
  return slug;
};
