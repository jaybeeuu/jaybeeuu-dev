import { postContentTypeDefinition } from "./post.js";
import { techRadarContentTypeDefinition } from "./tech-radar.js";

export const contentTypeDefinitions = {
  post: postContentTypeDefinition,
  // eslint-disable-next-line @typescript-eslint/naming-convention
  "tech-radar": techRadarContentTypeDefinition,
} as const;

export { postContentTypeDefinition } from "./post.js";
export { techRadarContentTypeDefinition } from "./tech-radar.js";

export type {
  PostInputMetadata,
  PostOutputMetadata,
  PostManifestEntry,
  PostManifest,
  ReadingTime,
} from "./post.js";

export type {
  TechRadarInputMetadata,
  TechRadarOutputMetadata,
  TechRadarManifestEntry,
  TechRadarManifest,
  TechRadarQuadrant,
  TechRadarRing,
} from "./tech-radar.js";

export { isPostInputMetadata, isReadingTime, isPostManifest } from "./post.js";

export { isTechRadarInputMetadata } from "./tech-radar.js";
