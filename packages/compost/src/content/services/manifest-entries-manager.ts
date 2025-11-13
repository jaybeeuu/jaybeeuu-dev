import type { Result } from "@jaybeeuu/utilities";
import { failure, success } from "@jaybeeuu/utilities";
import type { V2Entry } from "./manifest/index.js";

export class ManifestEntriesManager<TEntry extends V2Entry> {
  private readonly entries = new Map<string, TEntry>();

  addEntry(
    slug: string,
    manifestEntry: TEntry,
    filePath: string,
  ): Result<void, "slug already exists"> {
    if (this.entries.has(slug)) {
      return failure(
        "slug already exists",
        `Slug '${slug}' is not unique. Found duplicate in file: ${filePath}`,
      );
    }

    this.entries.set(slug, manifestEntry);
    return success(undefined);
  }

  getEntries(): Map<string, TEntry> {
    return new Map(this.entries);
  }

  hasSlug(slug: string): boolean {
    return this.entries.has(slug);
  }

  size(): number {
    return this.entries.size;
  }
}
