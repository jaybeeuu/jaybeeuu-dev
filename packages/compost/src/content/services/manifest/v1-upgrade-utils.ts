import { getSha1Hex } from "../../../hash.js";

export function generateV1UpgradeHash(fileName: string): string {
  return getSha1Hex(`v1-upgrade-${fileName}`);
}

export function isV1UpgradeHash(
  hash: string,
  fileName: string,
  slug: string,
): boolean {
  if (!hash || (hash.length !== 32 && hash.length !== 40)) return false;

  const pattern = new RegExp(`^${escapeRegExp(slug)}-(\\w+)\\.html$`);
  const match = fileName.match(pattern);

  if (match && match[1]) {
    const expectedV1Hash = getSha1Hex(`v1-upgrade-${match[1]}`);
    if (hash === expectedV1Hash) {
      return true;
    }
  }

  const fallbackV1Hash = generateV1UpgradeHash(fileName);
  return hash === fallbackV1Hash;
}

export function shouldUseV1CompatMode(
  oldEntry: { fileName?: string; hash?: string } | undefined,
  fileName: string,
  slug: string,
): boolean {
  if (!oldEntry) return false;
  if (!oldEntry.hash) return true;
  return isV1UpgradeHash(oldEntry.hash, fileName, slug);
}

export function detectContentChange(
  oldEntry: { fileName?: string; hash?: string } | undefined,
  fileName: string,
  contentHash: string,
  slug: string,
): boolean {
  if (!oldEntry) return false;

  const useV1Compat = shouldUseV1CompatMode(oldEntry, fileName, slug);

  return useV1Compat
    ? oldEntry.fileName !== fileName
    : oldEntry.hash !== contentHash;
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
