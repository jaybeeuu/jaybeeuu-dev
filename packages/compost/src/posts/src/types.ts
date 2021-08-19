export interface PostMetaData {
  abstract: string;
  fileName: string;
  href: string;
  lastUpdateDate: string | null;
  publishDate: string;
  slug: string;
  title: string;
  publish: boolean;
}

export interface PostManifest {
  [slug: string]: PostMetaData;
}

export interface PostRedirectsMap {
  [oldHash: string]: string;
}

export interface UpdateOptions {
  additionalWatchPaths: string[];
  hrefRoot: string;
  includeUnpublished: boolean;
  manifestFileName: string;
  oldManifestLocators: string[];
  outputDir: string;
  requireOldManifest: boolean;
  sourceDir: string;
  watch: boolean;
}
