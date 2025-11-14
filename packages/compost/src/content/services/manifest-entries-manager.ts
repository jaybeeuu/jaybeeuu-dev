import type { Result } from "@jaybeeuu/utilities";
import { failure, success } from "@jaybeeuu/utilities";
import type { BaseOutputMeta } from "./manifest/index.js";

export class ManifestEntriesManager<Entry extends BaseOutputMeta> {
  private readonly entries = new Map<string, Entry>();

  addEntry(
    slug: string,
    manifestEntry: Entry,
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

  getEntries(): Map<string, Entry> {
    return new Map(this.entries);
  }

  hasSlug(slug: string): boolean {
    return this.entries.has(slug);
  }

  size(): number {
    return this.entries.size;
  }
}
