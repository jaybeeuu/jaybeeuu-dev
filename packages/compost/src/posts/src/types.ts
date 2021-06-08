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
  oldManifestLocator?: string;
  outputDir: string;
  sourceDir: string;
  watch: boolean;
}
