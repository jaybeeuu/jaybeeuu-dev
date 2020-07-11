export interface PostMetaData {
  abstract: string;
  fileName: string;
  href: string;
  lastUpdateDate: string | null;
  publishDate: string;
  slug: string;
  title: string;
}

export interface PostManifest {
  [slug: string]: PostMetaData;
}

export interface PostRedirectsMap {
  [oldHash: string]: string;
}

export interface UpdateOptions {
  manifestFileName: string;
  outputDir: string;
  sourceDir: string;
}